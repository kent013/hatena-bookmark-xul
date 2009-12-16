const EXPORT = ['Star'];

let E = createElementBindDocument(document, XHTML_NS);

var Star = {
    BASE_URI: 'http://s.hatena.ne.jp/',

    EVENT_STAR_ACTIVATED:             'HB_StarActivated',
    EVENT_STAR_INNER_COUNT_ACTIVATED: 'HB_StarInnerCountActivated',
    EVENT_STAR_ADD_BUTTON_ACTIVATED:  'HB_StarAddButtonActivated',

    // XXX Needs localization of quotation marks.
    OPEN_QUOTE: '"',
    CLOSE_QUOTE: '"',

    rks: '',
    baseElements: null,

    init: function Star_init(settings) {
        let elements = {};
        for (let [color, setting] in new Iterator(settings.stars)) {
            let star = E('img', { src: setting.src, alt: setting.alt });
            if (color !== 'temp')
                star = E('a', { class: 'hBookmark-star' }, star);
            elements[color] = star;
        }
        Star.baseElements = elements;
    },

    get canModify Star_get_canModify() !!(User.user && Star.rks),

    get tooltip Star_get_tooltip() {
        let tooltip = {
            body: document.getElementById('hBookmark-star-tooltip'),
            icon: document.getElementById('hBookmark-star-tooltip-icon'),
            user: document.getElementById('hBookmark-star-tooltip-user'),
            quote: document.getElementById('hBookmark-star-tooltip-quote'),
        };
        delete Star.tooltip;
        return Star.tooltip = tooltip;
    },

    createStar: function Star_createStar(user, quote, color, highlight) {
        var star = Star.baseElements[color].cloneNode(true);
        star.href = Star.BASE_URI + user + '/';
        star.user = user;
        star.quote = quote;
        star.highlight = highlight;
        return star;
    },

    createTemporaryStar: function Star_createTemoporaryStar() {
        return Star.baseElements['temp'].cloneNode(true);
    },

    createStarsForEntry: function Star_createStarsForEntry(entry, highlight,
                                                           withAddButton) {
        if (typeof withAddButton === 'undefined')
            withAddButton = Star.canModify;
        let starsList = [];
        if (entry.colored_stars)
            starsList = entry.colored_stars.concat();
        if (entry.stars)
            starsList.push({ color: 'yellow', stars: entry.stars });
        let container = E('span', { class: 'hBookmark-star-container' });
        starsList.forEach(function (stars) {
            let color = stars.color;
            stars.stars.forEach(function (star) {
                if (typeof star === 'number') {
                    let span = E('span',
                                 { class: 'hBookmark-star-inner-count ' + color,
                                   tabindex: 0 },
                                 star);
                    span.targetURI = entry.uri;
                    container.appendChild(span);
                } else {
                    // XXX Do something with |star.count|.
                    let elem = Star.createStar(star.name, star.quote, color, highlight);
                    container.appendChild(elem);
                }
            });
        });
        if (withAddButton) {
            //container.insertBefore(Star.createAddButton(entry.uri),
            //                       container.firstChild);
        }
        return container;
    },

    childTextExpression: document.createExpression('*/text()', null),

    createHighlightedContainer: function Star_createHighlightedContainer(base, keyword) {
        let container = base.cloneNode(true);
        let texts = Star.childTextExpression.evaluate(container,
                        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < texts.snapshotLength; i++) {
            let text = texts.snapshotItem(i);
            while (text) {
                let start = text.data.indexOf(keyword);
                if (start === -1) break;
                let keywordText = text.splitText(start);
                let restText = keywordText.splitText(keyword.length);
                let em = E('em', { class: 'hBookmark-star-highlight' });
                text.parentNode.replaceChild(em, keywordText);
                em.appendChild(keywordText);
                text = restText;
            }
        }
        return container;
    },

    onClick: function Star_onClick(event) {
        let newEventType = null;
        let target = event.target;
        if (target instanceof Ci.nsIDOMHTMLImageElement) {
            if (target.className === 'hBookmark-star-add-button')
                newEventType = Star.EVENT_STAR_ADD_BUTTON_ACTIVATED;
            else
                target = target.parentNode;
        }
        if (!newEventType) {
            if (target.className === 'hBookmark-star')
                newEventType = Star.EVENT_STAR_ACTIVATED;
            else if (target.className.indexOf('hBookmark-star-inner-count ') === 0)
                newEventType = Star.EVENT_STAR_INNER_COUNT_ACTIVATED;
        }
        if (newEventType) {
            event.stopPropagation();
            event.preventDefault();
            let newEvent = document.createEvent('Event');
            newEvent.initEvent(newEventType, true, false);
            target.dispatchEvent(newEvent);
        }
    },

    currentStar: null,

    onMouseOver: function Star_onMouseOver(event) {
        let target = event.target;
        if (target instanceof Ci.nsIDOMHTMLImageElement) {
            if (target.className === 'hBookmark-star-add-button') {
                // XXX Do something with add-button.
                return;
            }
            target = target.parentNode;
        }
        if (target.className !== 'hBookmark-star' || !target.user) return;
        let tooltip = Star.tooltip;
        tooltip.icon.src = UserUtils.getProfileIcon(target.user);
        tooltip.user.value = target.user;
        if (target.quote) {
            tooltip.quote.textContent =
                Star.OPEN_QUOTE + target.quote + Star.CLOSE_QUOTE;
            tooltip.quote.collapsed = false;
            if (target.highlight) {
                let parent = target.parentNode.parentNode;
                if (!target.originalContainer) {
                    target.originalContainer =
                        parent.getElementsByClassName('hBookmark-star-highlight-container').item(0);
                    target.highlightedContainer =
                        Star.createHighlightedContainer(target.originalContainer, target.quote);
                }
                parent.replaceChild(target.highlightedContainer,
                                    target.originalContainer);
            }
        } else {
            tooltip.quote.collapsed = true;
        }
        tooltip.body.openPopup(target, 'after_start', 0, 0, false, false);
        Star.currentStar = target;
    },

    onMouseOut: function Star_onMouseOut(event) {
        let star = Star.currentStar;
        if (!star || Star.isInTooltip(event.relatedTarget)) return;
        Star.currentStar = null;
        if (star.highlightedContainer &&
            star.highlightedContainer.parentNode) {
            star.highlightedContainer.parentNode.replaceChild(
                star.originalContainer, star.highlightedContainer);
        }
        Star.tooltip.body.hidePopup();
    },

    isInTooltip: function Star_isInTooltip(element) {
        let tooltip = Star.tooltip.body;
        for (let i = 0; element && i++< 3; element = element.parentNode)
            if (element === tooltip)
                return true;
        return false;
    },
};

// XXX Includes images within the skin package.
// \u2606 is a star (☆), \u2605 is a black star (★).
Star.DEFAULT_SETTINGS = {
    stars: {
        yellow: {
            src: Star.BASE_URI + 'images/star.gif',
            alt: '\u2606',
        },
        green: {
            src: Star.BASE_URI + 'images/star-green.gif',
            alt: '\u2605',
        },
        red: {
            src: Star.BASE_URI + 'images/star-red.gif',
            alt: '\u2605',
        },
        blue: {
            src: Star.BASE_URI + 'images/star-blue.gif',
            alt: '\u2605',
        },
        purple: {
            src: Star.BASE_URI + 'images/star-purple.gif',
            alt: '\u2605',
        },
        temp: {
            src: Star.BASE_URI + 'imgages/star-temp.gif',
            alt: '\u2606',
        },
    },
    addButton: {
    },
};

Star.init(Star.DEFAULT_SETTINGS);
