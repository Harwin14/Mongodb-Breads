const moment = require('moment')
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');


module.exports = (db) => {
    router.get('/', async (req, res,) => {
        const url = req.url == '/' ? '/?page=1&sortBy=id&orderBy=asc' : req.url
        let page = req.query.page || 1
        page = Number(page)
        const limit = 3
        const offset = (page - 1) * limit
        const noSql = {}

        const sortMode = {}

        let sortBy =  req.query.sortBy || "id"
        let orderBy = req.query.orderBy || "asc" 

        sortMode[sortBy] = orderBy == "asc" ? 1 : -1

        if (req.query.string && req.query.stringFilters == 'on') {
            noSql["string"] = new RegExp(`${req.query.string}`, 'i')
        }
        if (req.query.integer && req.query.integerFilters == 'on') {
            noSql['integer'] = parseInt(req.query.integer)

        }
        if (req.query.float && req.query.floatFilters == 'on') {
            noSql['float'] = JSON.parse(req.query.float)

        }
        if (req.query.dateFilters == 'on') {
            if (req.query.startDate != '' & req.query.endDate != '') {
                noSql['date'] = { $gte: new Date(`${req.query.startDate}`), $lte: new Date(`${req.query.endDate}`) }

            } else if (req.query.startDate) {
                noSql['date'] = { $gte: new Date(`${req.query.startDate}`) }

            } else if (req.query.endDate) {
                noSql['date'] = { $lte: new Date(`${req.query.endDate}`) }

            }
        }
        if (req.query.boolean && req.query.booleanFilters == 'on') {
            noSql['boolean'] = req.query.boolean
        }
        // console.log(req.query.boolean)
        // console.log(noSql)
        db.collection("breads").find(noSql).toArray((err, result) => {
            if (err) {
                console.error(err)
            }
            let total = result.length
            const pages = Math.ceil(total / limit)

            db.collection("breads").find(noSql).skip(offset).limit(limit).sort(sortMode).toArray((err, data) => {
                if (err) {
                    console.log(err)
                }
                res.render('list', { data, pages, page,  query: req.query, sortBy, orderBy, moment, offset, url })
            })
        })

    });

    //=========ADD===========\\
    router.get('/add', (req, res) => {
        res.render('add')
    })
    router.post('/add', (req, res) => {
        let myobj = {
            string: `${req.body.string}`,
            integer: parseInt(req.body.integer),
            float: JSON.parse(req.body.float),
            date: new Date(`${req.body.date}`),
            boolean: req.body.boolean
        }

        db.collection("breads").insertOne(myobj, (err, res) => {
            if (err) throw err
        })

        res.redirect('/')
    })

    //=========DELETE===========\\
    router.get('/delete/:id', (req, res) => {
        db.collection("breads").deleteOne({ "_id": ObjectId(`${req.params.id}`) }, (err) => {
            if (err) {
                console.error(err)
            }
        })
        res.redirect('/')
    })

    router.get('/edit/:id', (req, res) => {
        db.collection("breads").find({ "_id": ObjectId(`${req.params.id}`) }).toArray((err, data) => {
            if (err) {
                console.log(err)
            } //console.log(data[0])
            res.render('edit', { item: data[0], moment })
        })
    })

    router.post('/edit/:id', (req, res) => {

        let myobj = {
            string: `${req.body.string}`,
            integer: parseInt(req.body.integer),
            float: JSON.parse(req.body.float),
            date: new Date(req.body.date),
            boolean: req.body.boolean
        }

        db.collection("breads").updateOne({ "_id": ObjectId(`${req.params.id}`) }, { $set: myobj }, (err, res) => {
            if (err) throw err
            // console.log(myobj)
        })
        res.redirect('/')
    })

    return router;

}