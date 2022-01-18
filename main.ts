function onSubmit(e: GoogleAppsScript.Events.FormsOnFormSubmit) {
    Logger.log(e.response.getItemResponses().length)
    e.response.getItemResponses().forEach(itemResp => {
        const item = itemResp.getItem()
        Logger.log(`type=${item.getType()}, title=${item.getTitle()}, resp=${itemResp.getResponse()}`)
    })
}
