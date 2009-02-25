
function setUp() {
    utils.include("../../components/TagSearch.js");
}

function testGetTagSearchService() {
    let TagSearch = Components.classes["@mozilla.org/autocomplete/search;1?name=hbookmark-tag"].
                    getService(Components.interfaces.nsIAutoCompleteSearch);
    assert.isTrue(TagSearch instanceof Components.interfaces.nsIAutoCompleteSearch);
}

function testSplitComment() {
    let TSR = TagSearchResult;
    assert.equals(TSR.splitComment("[", 1), ["[", null, ""]);
    assert.equals(TSR.splitComment("[a", 2), ["", "a", ""]);
    assert.equals(TSR.splitComment("[a]", 3), ["[a]", null, ""]);
    assert.equals(TSR.splitComment("[a][", 4), ["[a][", null, ""]);
    assert.equals(TSR.splitComment("[a][b", 5), ["[a]", "b", ""]);
    assert.equals(TSR.splitComment("[a]b[c", 6), ["[a]b[c", null, ""]);

    assert.equals(TSR.splitComment("[a][bc", 3), ["[a]", null, "[bc"]);
    assert.equals(TSR.splitComment("[a][bc", 4), ["[a][", null, "bc"]);
    assert.equals(TSR.splitComment("[a][bc", 5), ["[a]", "b", "c"]);
    assert.equals(TSR.splitComment("[a][b]c", 4), ["[a]", "b", "c"]);
}