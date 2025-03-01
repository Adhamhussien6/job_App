export const pagination = async ({ page = 1, limit = 10, model, populate = [], filter = {}, sort = {} } = {}) => {
    let _page = page * 1 || 1
     if (_page < 1) {
          page = 1
     }
    //const limit = 2
    const totalCount = await model.countDocuments(filter);
    const skip = (_page - 1) * limit
    const data = await model.find(filter).limit(limit).skip(skip).populate(populate).sort(sort)
    return{data,_page,totalCount}
     
}

