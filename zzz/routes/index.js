const moment = require('moment')
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { param } = require('./users');

module.exports = function (db) {

  router.get('/', async function (req, res,) {
    const url = req.url == '/' ? '/?page=1' : req.url
    const page = req.query.page || 1
    const limit = 3;
    const offset = (page - 1) * limit
    const params = []
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

    let noSql = '{'
    if (params.length > 0) {
      noSql += `${params.join(',')}`
    }
    noSql += '}'
    noSql = JSON.parse(noSql)

    // if (req.query.id && req.query.idFilters == 'on') {
    //   params.push({ "_id": ObjectId(`${req.params.id}`) })
    // }
    if (req.query.string && req.query.stringFilters == 'on') {
      params.push(`"string" : ${req.query.string}`)
    }
    if (req.query.integer && req.query.integerFilters == 'on') {
      params.push(`"integer": ${req.query.integer}`)
    }
    if (req.query.float && req.query.floatilters == 'on') {
      params.push(`"float": ${req.query.float}`)
    }
    if (req.query.dateFilters == 'on') {
      if (req.query.starDate != '' & req.query.endDate != '') {
        param.push(`"date" :{ "$gte": "${req.query.starDate}","$lte": "${req.query.endDate}"}`)
      }
      if (req.query.starDate) {
        param.push(`"date" :{ "$gte": "${req.query.starDate}"}`)
      }
      if (req.query.endDate) {
        param.push(`"date" :{ "$lte": "${req.query.endDate}"}`)
      }
    }
    if (req.query.boolean && req.query.booleanFilters == 'on') {
      params.push(`"boolean" : ${req.query.boolean}`)
    }

    db.collection("breads").find().toArray(function (err, result) {
      if (err) {
        console.error(err)
      }
      var total = result.length
      const pages = Math.ceil(total / limit)
      db.collection("breads").find(noSql).skip(offset).limit(limit).collation({'locale':'en'}).sort(sortMode).toArray((err, data) => {
        if (err) {
          console.log(err)
        }
        res.render('list', { data, pages, page, filter, query: req.query, sortBy, orderBy, moment, url})
      })
    })
    
  });
  router.get('/add', (req, res) => {
    res.render
  })
  
  return router;

}