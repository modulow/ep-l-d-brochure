#target "InDesign"

(function () {
    var SOURCE_DOCUMENT = "brochuere26_moodboard-6.indd";
    var TEMPLATE_DOCUMENT = "test 6 item brochure3.indd";

    function documentByName(name) {
        var documentName = name.toLowerCase();
        for (var index = 0; index < app.documents.length; index++) {
            if (app.documents[index].name.toLowerCase() === documentName) {
                return app.documents[index];
            }
        }
        return null;
    }

    function firstLevelItems(page) {
        var items = [];
        var pageBounds = page.bounds;
        for (var index = 0; index < page.pageItems.length; index++) {
            var item = page.pageItems[index];
            var parentName = item.parent.constructor.name;
            var itemBounds = item.geometricBounds;
            var touchesPage = itemBounds[2] > pageBounds[0] && itemBounds[0] < pageBounds[2] &&
                itemBounds[3] > pageBounds[1] && itemBounds[1] < pageBounds[3];
            if (item.parentPage === page && parentName !== "Group" && touchesPage) {
                items.push(item);
            }
        }
        return items;
    }

    function templateSlots(page) {
        var frames = [];
        var seenIds = {};
        for (var index = 0; index < page.allGraphics.length; index++) {
            var frame = page.allGraphics[index].parent;
            var frameId = String(frame.id);
            if (!seenIds[frameId]) {
                seenIds[frameId] = true;
                frames.push(frame);
            }
        }

        frames.sort(function (first, second) {
            var firstBounds = first.geometricBounds;
            var secondBounds = second.geometricBounds;
            var firstArea = (firstBounds[3] - firstBounds[1]) * (firstBounds[2] - firstBounds[0]);
            var secondArea = (secondBounds[3] - secondBounds[1]) * (secondBounds[2] - secondBounds[0]);
            return secondArea - firstArea;
        });

        if (frames.length < 6) {
            throw Error("The template needs at least six graphic frames. Found: " + frames.length + ".");
        }

        frames.length = 6;
        return sortReadingOrder(frames);
    }

    function sortReadingOrder(items) {
        items.sort(function (first, second) {
            var firstBounds = first.geometricBounds;
            var secondBounds = second.geometricBounds;
            var verticalDifference = firstBounds[0] - secondBounds[0];

            if (Math.abs(verticalDifference) > 6) {
                return verticalDifference;
            }
            return firstBounds[1] - secondBounds[1];
        });
        return items;
    }

    function pageRelativeBounds(itemBounds, pageBounds) {
        return [
            itemBounds[0] - pageBounds[0],
            itemBounds[1] - pageBounds[1],
            itemBounds[2] - pageBounds[0],
            itemBounds[3] - pageBounds[1]
        ];
    }

    function placeInSlot(item, slotBounds, outputPage) {
        var outputPageBounds = outputPage.bounds;
        var absoluteSlotBounds = [
            outputPageBounds[0] + slotBounds[0],
            outputPageBounds[1] + slotBounds[1],
            outputPageBounds[0] + slotBounds[2],
            outputPageBounds[1] + slotBounds[3]
        ];
        var itemBounds = item.geometricBounds;
        var itemWidth = itemBounds[3] - itemBounds[1];
        var itemHeight = itemBounds[2] - itemBounds[0];
        var slotWidth = absoluteSlotBounds[3] - absoluteSlotBounds[1];
        var slotHeight = absoluteSlotBounds[2] - absoluteSlotBounds[0];
        var scale = Math.min(slotWidth / itemWidth, slotHeight / itemHeight);

        if (itemWidth <= 0 || itemHeight <= 0 || slotWidth <= 0 || slotHeight <= 0 || !isFinite(scale)) {
            throw Error("An item or template slot has invalid dimensions and cannot be placed.");
        }

        item.resize(
            CoordinateSpaces.PASTEBOARD_COORDINATES,
            AnchorPoint.CENTER_ANCHOR,
            ResizeMethods.MULTIPLYING_CURRENT_DIMENSIONS_BY,
            [scale * 100, scale * 100]
        );

        itemBounds = item.geometricBounds;
        itemWidth = itemBounds[3] - itemBounds[1];
        itemHeight = itemBounds[2] - itemBounds[0];
        item.move([
            absoluteSlotBounds[1] + (slotWidth - itemWidth) / 2,
            absoluteSlotBounds[0] + (slotHeight - itemHeight) / 2
        ]);
    }

    function addOutputPage(destination) {
        return destination.pages.add(LocationOptions.AFTER, destination.pages.lastItem());
    }

    function clearDestination(destination) {
        while (destination.pages.length > 1) {
            destination.pages.lastItem().remove();
        }
        while (destination.pages[0].pageItems.length > 0) {
            destination.pages[0].pageItems.lastItem().remove();
        }
        return destination.pages[0];
    }

    function duplicatePageAsItem(sourcePage, outputPage) {
        var sourcePageItems = firstLevelItems(sourcePage);
        var copiedItems = [];

        for (var index = 0; index < sourcePageItems.length; index++) {
            copiedItems.push(sourcePageItems[index].duplicate(outputPage));
        }

        return outputPage.groups.add(copiedItems);
    }

    if (app.documents.length === 0) {
        throw Error("Open and activate the blank destination document before running this script.");
    }

    var destination = app.activeDocument;
    var source = documentByName(SOURCE_DOCUMENT);
    var template = documentByName(TEMPLATE_DOCUMENT);

    if (source === null) {
        throw Error("Open '" + SOURCE_DOCUMENT + "' before running this script.");
    }
    if (template === null) {
        throw Error("Open '" + TEMPLATE_DOCUMENT + "' before running this script.");
    }
    if (destination === source || destination === template) {
        throw Error("Activate the blank destination document before running this script.");
    }

    var templateFrames = templateSlots(template.pages[0]);
    var slots = [];
    for (var slotIndex = 0; slotIndex < templateFrames.length; slotIndex++) {
        slots.push(pageRelativeBounds(templateFrames[slotIndex].geometricBounds, template.pages[0].bounds));
    }

    var sourceItems = [];
    for (var pageIndex = 0; pageIndex < source.pages.length; pageIndex++) {
        var pageItems = sortReadingOrder(firstLevelItems(source.pages[pageIndex]));
        if (pageItems.length === 0) {
            throw Error("Source page " + (pageIndex + 1) + " does not contain a first-level item.");
        }
        sourceItems.push(source.pages[pageIndex]);
    }

    var firstOutputPage = clearDestination(destination);
    var pageCount = Math.ceil(sourceItems.length / slots.length);
    var skippedItems = 0;
    for (var outputPageIndex = 0; outputPageIndex < pageCount; outputPageIndex++) {
        var outputPage = outputPageIndex === 0 ? firstOutputPage : addOutputPage(destination);

        for (var slotItemIndex = 0; slotItemIndex < slots.length; slotItemIndex++) {
            var sourceItemIndex = outputPageIndex * slots.length + slotItemIndex;
            if (sourceItemIndex >= sourceItems.length) {
                break;
            }

            var copiedItem = null;
            try {
                copiedItem = duplicatePageAsItem(sourceItems[sourceItemIndex], outputPage);
                copiedItem.move(outputPage);
                placeInSlot(copiedItem, slots[slotItemIndex], outputPage);
            } catch (error) {
                if (copiedItem !== null && copiedItem.isValid) {
                    copiedItem.remove();
                }
                skippedItems++;
            }
        }
    }

    alert((sourceItems.length - skippedItems) + " items were copied to " + pageCount + " six-item pages in '" + destination.name + "'. " + skippedItems + " invalid or pasteboard items were ignored.");
}());