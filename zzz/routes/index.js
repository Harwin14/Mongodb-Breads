const moment = require('moment')
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { param } = require('./users');
const { json } = require('express');

module.exports = function (db) {

  router.get('/', async function (req, res,) {
    const url = req.url == '/' ? '/?page=1' : req.url
    let page = req.query.page || 1
    page = Number(page)
    const limit = 3;
    const offset = (page - 1) * limit
     let noSql= {}
    // const params = []
    const filter = `&idFilters=${req.query.idFilters}&id=${req.query.id}
      &stringFilters=${req.query.stringFilters}&string=${req.query.string}
      $integerFilters=${req.query.integerFilters}&integer=${req.query.integer}
      &floatFilters=${req.query.floatFilters}&float=${req.query.float}
      &dateFilters=${req.query.dateFilters}&startDate=${req.query.starDate}
      &endDate=${req.query.endDate}&booleanFilters=${req.query.booleanFilters}
      &boolean=${req.query.boolean}`

    let sortBy = req.query.sortBy === undefined ? "string" : req.query.sortBy
    let orderBy = req.query.orderBy === undefined ? 1 : req.query.orderBy
    let sortMode = JSON.parse(`{"${sortBy}" : ${orderBy}}`)

   
    // let noSql = '{'
    // if (params.length > 0) {
    //   noSql += `${params.join(',')}`
    // }
    // noSql += '}'
    // noSql = JSON.parse(noSql)

    // if (req.query.id && req.query.idFilters == 'on') {
    //   params.push({ "_id": ObjectId(`${req.params.id}`) })
    // }
    if (req.query.string && req.query.stringFilters == 'on') {
      noSql["string"] = new RegExp(`${req.query.string}`, 'i')
    }
    if (req.query.integer && req.query.integerFilters == 'on') {
      noSql['integer'] = parseInt(`${req.query.integer}`)
      // params.push(`"integer": ${req.query.integer}`)
    }
    if (req.query.float && req.query.floatFilters == 'on') {
      noSql['float'] = JSON.parse(`${req.query.float}`)
    //  params.push(`"float": ${req.query.float}`)
    }
    if (req.query.dateFilters == 'on') {
      if (req.query.startDate != '' & req.query.endDate != '') {
        noSql['date'] = { $gte: new Date(`${req.query.startDate}`), $lte: new Date(`${req.query.endDate}`) }
        //param.push(`"date" :{ "$gte": "${req.query.starDate}","$lte": "${req.query.endDate}"}`)
      }
      else if (req.query.startDate) {
        noSql['date'] = { $gte: new Date(`${req.query.startDate}`) }
        // param.push(`"date" :{ "$gte": "${req.query.starDate}"}`)
      }
      else if (req.query.endDate) {
        noSql['date'] = { $lte: new Date(`${req.query.endDate}`) }
        //param.push(`"date" :{ "$lte": "${req.query.endDate}"}`)
      }
    }
    if (req.query.boolean && req.query.booleanFilters == 'on') {
      noSql['boolean'] = JSON.parse(req.query.boolean)
    }
  console.log(noSql)
    db.collection("breads").find(noSql).toArray(function (err, result) {
      if (err) {
        console.error(err)
      }
      const total = result.length
      const pages = Math.ceil(total / limit)

      db.collection("breads").find(noSql).skip(offset).limit(limit).collation({ 'locale': 'en' }).sort(sortMode).toArray((err, data) => {
        if (err) {
          console.log(err)
        
        }
        res.render('list', { data, pages, page, filter, query: req.query, sortBy, orderBy, moment, offset, url })
      })
    })

  });
  router.get('/add', (req, res) => {
    res.render('add')
  })
  router.post('/add', (req, res) => {
    var myobj = {
      string: `${req.body.string}`,
      integer: parseInt(req.body.integer),
      float: JSON.parse(req.body.float),
      date: new Date(req.body.date),
      boolean: JSON.parse(req.body.boolean)
    }
    
    db.collection("breads").insertOne(myobj, function (err, res) {
      if (err) throw err 
    })
    console.log(myobj)
    res.redirect('/')
  })

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
    //const { string, integer, float, date, boolean } = req.body
    var myobj = {
      string: `${req.body.string}`,
      integer: parseInt(req.body.integer),
      float: JSON.parse(req.body.float),
      date: new Date(req.body.date),
      boolean: JSON.parse(req.body.boolean)
    }

    db.collection("breads").updateOne({ "_id": ObjectId(`${req.params.id}`) }, { $set: myobj }, function (err, res) {
      if (err) {
 console.log(error)
      }
    })
    res.redirect('/')
  })



  return router;

}