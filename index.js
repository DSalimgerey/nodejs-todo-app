'use strict'

import {createServer} from 'node:http'
import express from 'express'
import sqlite3 from 'sqlite3'
import morgan from 'morgan'
import cors from 'cors'
import {actionMsgTemplates} from './templates.js'

sqlite3.verbose()

const port = 3000
const app = express()
const server = createServer(app)
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('err', err)
    return
  }
  console.log('database connected')
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan())
app.use(cors())

app.get('/api/v0/todos', async (req, res) => {
  try {
    const todos = await new Promise((res, rej) => {
      db.all(`select * from todos where created_by_user_id = ?`, [1], (err, rows) => {
        if (err) {
          rej(err)
          return
        }
        res(rows)
      })
    }) 
    res.status(200).json({ todos: todos })
  } catch (err) {
    console.error(err)
  }
})
app.post('/api/v0/todos', async (req, res) => {
  try {
    const columns = Object.keys(req.body)
    const values = Object.values(req.body)
    await new Promise((res, rej) => {
      db.serialize(() => {
        db.run(`insert into todos (title, created_by_user_id) values (?, ?)`, [req.body.title, req.body.user_id], (err) => {
          if (err) {
            rej(err)
            return
          }
          res()
        })
        /*
        TODO: write logic for adding new action item when user create new todo
        db.run(`insert into actions (action_type, created_by_user_id) values (?, ?)`, [], (err) => {
          if (err) {
            rej(err)
            return 
          }
          res()
        })
        */
      })
    })
    res.status(200).json({ message: 'todo created' })
  } catch (err) {
    console.error(err)
  }
})
app.post('/api/v0/projects', async (req, res) => {

})
async function main() {
  const users = [{email: 'adam@gmail.com', password: 'qwert'}, {email: 'sam@gmail.com', password: 'yuiop'}]
  const createActionMsg = actionMsgTemplates['create']
  const values = ['alex', 'todo', 'create user actions']
  let index = 0
  const regex = /\[[^\]]*\]/gi
  const msg = createActionMsg.replace(regex, (match) => {
    const replacement = match ? values[index] : match
    index++
    return replacement
  })
  console.log(msg)

  try {
    db.serialize(() => {
      db.run(`create table if not exists users (id integer primary key not null, email text not null, password text not null)`)
      db.run(`create table if not exists todos (
        id integer primary key not null,
        title text not null,
        created_at text default current_timestamp,
        updated_at text default current_timestamp,
        project_id integer,
        completed integer default 0,
        date text default current_date,
        created_by_user_id integer not null,
        foreign key (created_by_user_id) references users (id),
        foreign key (project_id) references projects (id)
      )`)
      db.run(`create table if not exists actions (
        id integer primary key not null,
        action_type text not null,
        created_by_user_id integer not null,
        created_at text not null default current_timestamp
      )`)
      db.run(`create table if not exists projects (id integer primary key not null, title text, created_by_user_id integer not null, created_at text not null default current_timestamp)`)
      db.run(`create table if not exists user_projects (user_id integer not null, project_id integer not null, foreign key (user_id) references users (id), foreign key (project_id) references projects (id))`)
      const usersStmt = db.prepare(`insert into users (email, password) values(?, ?)`)
      users.forEach((user) => usersStmt.run(...Object.values(user)))
      usersStmt.finalize()
    })
    server.listen(port, () => console.log(`listen on ${port}`))
  } catch (err) {
    db.close((err) => {
      if (err) {
        console.error('err', err)
        return
      }
      console.log('database connection is closed')
    })
    console.error(err)
  }
} 

main()
