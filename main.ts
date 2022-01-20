function onSubmit(e: GoogleAppsScript.Events.FormsOnFormSubmit) {
    const formResp = e.response
    Logger.log(formResp.getItemResponses().length)
    formResp.getItemResponses().forEach(itemResp => {
        const item = itemResp.getItem()
        Logger.log(`type=${item.getType()}, title=${item.getTitle()}, resp=${itemResp.getResponse()}, id=${item.getId()}, index=${item.getIndex()}`)
    })
    const p = responseToParam(formResp);
    const resp = createIssue(p);
    Logger.log(`response code=${resp.getResponseCode()}`)
}

type response = { [key: string]: string }
function responseToParam(resp: GoogleAppsScript.Forms.FormResponse): response {
    return resp.getItemResponses().reduce((acc: response, itemResp) => {
        const item = itemResp.getItem();
        acc[item.getTitle()] = respToData(item, itemResp.getResponse())
        return acc
    }, {})
}

function respToData(item: GoogleAppsScript.Forms.Item, resp: string | string[] | string[][]): string {
    switch (item.getType()) {
        case FormApp.ItemType.CHECKBOX_GRID:
            const cgiResp = resp as string[][]
            return item.asCheckboxGridItem().getRows().map((v, index) => {
                return v + ":" + (cgiResp[index]?.join(",") ?? "none") + "\n"
            }).join("")
        case FormApp.ItemType.GRID:
            const giResp = resp as string[]
            const gi = item.asGridItem()
            return gi.getRows().map((v, index) => {
                return v + ":" + giResp[index] + "\n"
            }).join("")
        default:
            return resp as string
    }
}


function createIssue(resp: response): GoogleAppsScript.URL_Fetch.HTTPResponse {
    const token = PropertiesService.getScriptProperties().getProperty("TOKEN");
    const owner = "blck-snwmn"
    const repo = "gform-submit"

    const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
    // Markdown format
    const body = Object.keys(resp).reduce((acc, dateKey) => {
        const data = resp[dateKey]
        const body = `## ${dateKey}\n${data}\n\n`
        acc += body
        return acc
    }, "")
    Logger.log(body)

    const payload = {
        "title": "[Google Form]Test request",
        "body": body,
        "labels": ["test"]
    };
    const headers = {
        "Authorization": `token ${token}`
    };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        "contentType": "application/json; charset=utf-8",
        "headers": headers,
        "method": "post",
        "payload": JSON.stringify(payload)
    };
    return UrlFetchApp.fetch(url, options);
}
