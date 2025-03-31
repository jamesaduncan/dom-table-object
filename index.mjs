class TableQuery {
    constructor( rootNode, options = { insensitive: true } ) {
        this.root   = rootNode;
        this.options = options;
    }

    query( aString, { normalize, indexColumn = 0, offsetColumn = 1 } = { normalize: false, indexColumn: 0, offsetColumn: 1 } ) {
        const expressionRoot = `//tr/td[${indexColumn + 1}]`;
        let xpathExpression = `${expressionRoot}`;

        if (this.options.insensitive) {
            xpathExpression = `${xpathExpression}[starts-with(translate(text(),"abcdefghijklmnopqrstuvwxyz","ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "${aString.toUpperCase()}")]`;
        } else {
            xpathExpression = `${xpathExpression}[starts-with(text(), "${aString}")]`;
        }

        const resultExpressionComponents = [];
        for (let i = 0; i<offsetColumn; i++) {
            resultExpressionComponents.push( 'following-sibling::td')
        }
        const finalQuery = `${xpathExpression}/${resultExpressionComponents.join("/")}/text()`;
        
        const response = document.evaluate(finalQuery, this.root, null, 2, null);
        const responseString = response.stringValue;
        if (!normalize) return responseString;
        
        const normalized = document.evaluate(`${xpathExpression}/text()`, this.root, null, 2, null);
        const normalizedString = normalized.stringValue;
        return [normalizedString, responseString]
    }
}

export default TableQuery;
