'use strict'

import {createServer} from 'node:http'
import express from 'express'
import sqlite3 from 'sqlite3'
import morgan from 'morgan'
import cors from 'cors'

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

const notficationMsgTemplates = {
  create_todo: `🎉 [user] created new todo titled [title]. Review it and add your comments`,
  update_todo: `✏️ '[title]' has been updated by [user]. Check out the latest updates!`,
  invite: `👋 [user] wants you to be a part of [project]. Please review the invitation and join the conversation.`,
  completition: `🎉 [user] marked todo '[title]' as complete. Take a look at the finished result!`,
  comment: `🗨️ [user] has added a new comment to todo '[title]'. Check it out and reply if needed.`,
  assign: `📝 [user] has assigned you to todo '[title]'. Review the details and start working on it [link].`,
  share: `🔗 [user] has shared [task/document] '[Title]' with you. Access it [here/link] and collaborate!`,
  deadline_approaching: `⏰ Reminder: The deadline for todo '[title]' is approaching in [x] days. Make sure you're on track!"`,
  review: `📋 [User] has submitted [task/document] '[Title]' for your review. Please provide your feedback [here/link].`,
  status_change: `"🔄 The status of [task/document] '[Title]' has changed to [New Status] by [User]. See the updated status [here/link].`,
  file_upload: `📤 [User] has uploaded a new file: '[Filename]'. Access it [here/link] for review.`,
  file_download: `📥 [User] downloaded [file/document] '[Filename]'. If you need it, you can access it [here/link].`,
  progress_update: `📊 [User] updated the progress on [task/document] '[Title]' to [X]%. Check the progress and add any comments [here/link].`,
  new_member_join: `👋 Welcome [New Member] to [project/team]! They have joined us to work on [specific tasks/roles].`,
  feedback: `📢 [User] provided feedback on [task/document] '[Title]'. Read their feedback and respond [here/link].`,
  reaction: `[User] reacted to your comment on [] with [reaction type].`,
}

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
