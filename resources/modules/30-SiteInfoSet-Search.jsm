Components.utils.import("resource://hatenabookmark/modules/00-utils.jsm");
loadPrecedingModules.call(this);

const EXPORTED_SYMBOLS = [];

let builtInSearchSiteInfo = [
    /*
    {
        url:
        baseDomain:
        query:
        encoding:
        annotation:
        annotationPosition:
        style:
        disable:
    },
    */
    { // Google Web Search
        url:        /^http:\/\/www\.google(?:\.\w+){1,2}\/search\?/,
        baseDomain: /^google\./,
        query:      /[?&;]q=([^?&;#]+)/,
        encoding:   /[?&;]ie=([\w-]+)/,
        //annotation: 'id("res")',
        annotation: function (doc) {
            let table = doc.getElementById("mbEnd");
            if (table) {
                let tr = doc.createElement("tr");
                let td = doc.createElement("td");
                tr.appendChild(td);
                table.tBodies[0].appendChild(tr);
                return td;
            }
            if(doc.URL.match(/tbs=(rltm|mbl)/)){
                let block = doc.getElementById("rhs_block");
                if(block){
                    return block;
                }
            }
            return doc.getElementById("res");
        },
        annotationPosition: function (doc) {
            if(doc.URL.match(/tbs=(rltm|mbl)/)){
                return 'last';
            }else{
                return 'first';
            }
        },
        style: function (doc) {
            let style = <![CDATA[
                td > #hBookmark-search {
                    margin: 1em 0 0 0;
                    width: auto;
                    float: none;
                    white-space: normal;
                }
                div > #hBookmark-search {
                    font-size: 0.8em;
                    margin-right: -32%;
                }
            ]]>.toString();
            if(doc.URL.match(/tbs=(rltm|mbl)/)){
                style += <![CDATA[
                    div > #hBookmark-search {
                        margin-right: auto;
                        padding-left: 15px;
                        float: none;
                        width: auto;
                    }
                ]]>.toString();
            }
            return style;
        },
    },
    { // Yahoo Web Search
        url:        /^http:\/\/search\.yahoo(?:\.\w+){1,2}\/search\?/,
        baseDomain: /^yahoo\./,
        query:      /[?&;]p=([^?&;#]+)/,
        encoding:   /[?&;]ei=([\w-]+)/,
        annotation: function (doc) {
            return doc.getElementById("sIn");
        },
        style: function (doc) {
            return <![CDATA[
                #hBookmark-search {
                    width: auto;
                }
            ]]>.toString();
        },
    },
];

let Search = new SiteInfoSet({
    matcher: SiteInfoSet.createURLMatcher('url'),
    sources: [
        { file: 'Search.user.siteinfo.js' },
        { items: builtInSearchSiteInfo },
    ],
});

SiteInfoSet.Search = Search;
