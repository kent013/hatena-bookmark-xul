const EXPORT = "queryXPath queryXPathAll xml2dom".split(" ");

/* XXX To be impemented */
/*
function queryXPath(xpath, context, resultType);
function queryXPathAll(xpath, context);
*/

// XXX ToDo: optionsでrangeを指定できるようにしたい
function xml2dom(xml, options) {
    options = extend({
        prettyPrinting: false,
        context:        document,
    }, (typeof options.nodeType === "number") ? { context: options } : options);
    let prevSettings = XML.settings();
    XML.setSettings(options);
    let range = options.range;
    if (!range) {
        let context = options.context;
        if (context.nodeType === Node.DOCUMENT_NODE)
            context = context.documentElement;
        range = context.ownerDocument.createRange();
        range.selectNodeContents(context);
    }
    let result = range.createContextualFragment(xml.toXMLString());
    XML.setSettings(prevSettings);
    return result;
}
