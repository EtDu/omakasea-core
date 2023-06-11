class __BaseDAO__ {
    static __map__(fields, document) {
        return new Promise((resolve, reject) => {
            for (const f of Object.keys(fields)) {
                document[f] = fields[f];
            }
            resolve(document);
        });
    }

    static __extract__(schema, document) {
        const fields = {};
        for (const key of Object.keys(schema)) {
            if (key in document && document[key]) {
                fields[key] = document[key];
            }
        }

        delete fields.creatorAddress;
        delete fields.date;
        return fields;
    }

    static __search__(Model, query, fields = {}, orderBy = {}, limit = 0) {
        return new Promise((resolve, reject) => {
            Model.find(query)
                .sort(orderBy)
                .limit(limit)
                .select(fields)
                .exec((error, document) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(document);
                    }
                });
        });
    }

    static __get__(Model, query) {
        return new Promise((resolve, reject) => {
            Model.where(query).findOne((error, document) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(document);
                }
            });
        });
    }

    static getByAddress(Model, query) {
        return new Promise((resolve, reject) => {
            Model.find({owner: { $regex: new RegExp(query, "i") }})
            .then(document => {
                if(document.length > 0){
                    resolve(document);
                }else{
                    reject(new Error('No document found'));
                }
               
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    static __fetch__(Model, query) {
        return new Promise((resolve, reject) => {
            __BaseDAO__.__get__(Model, query).then((document) => {
                if (document === null) {
                    document = new Model(query);
                }

                resolve(document);
            });
        });
    }

    static __save__(document) {
        return new Promise((resolve, reject) => {
            document.save((error) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    resolve(document);
                }
            });
        });
    }
}

export default __BaseDAO__;
