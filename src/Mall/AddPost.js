// AddPost.js - TipTap 기반 WYSIWYG 에디터 (색상 제거 + TextStyle 복원)

"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Bold from "@tiptap/extension-bold"
import Italic from "@tiptap/extension-italic"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextStyle from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import TextAlign from "@tiptap/extension-text-align"
import Paragraph from "@tiptap/extension-paragraph"
import Heading from "@tiptap/extension-heading"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import CodeBlock from "@tiptap/extension-code-block"
import "../App.css"

function AddPost() {
  const navigate = useNavigate()
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: null,
    category: "자유",
    tags: [],
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"))
    if (user) setCurrentUser(user)
    else navigate("/LogIn")
  }, [navigate])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Paragraph,
      Heading,
      BulletList,
      OrderedList,
      CodeBlock,
    ],
    content: '<p>내용을 입력하세요...</p>',
    onUpdate: ({ editor }) => {
      setNewPost((prev) => ({ ...prev, content: editor.getHTML() }))
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setNewPost((prev) => ({ ...prev, [name]: value }))
  }

  const submitPost = (e) => {
    e.preventDefault()
    if (!newPost.title) return alert("제목을 입력하세요")

    const postToSave = {
      ...newPost,
      id: Date.now(),
      userId: currentUser.id,
      authorName: currentUser.name,
      date: new Date().toISOString().split("T")[0],
      views: 0,
    }
    const posts = JSON.parse(localStorage.getItem("boardPosts") || "[]")
    localStorage.setItem("boardPosts", JSON.stringify([postToSave, ...posts]))
    navigate("/Board")
  }

  return (
    <div className="post-form">
      <h3>새 게시물 작성</h3>
      <form onSubmit={submitPost}>
        <div>
          <label>카테고리:</label>
          <select name="category" value={newPost.category} onChange={handleChange}>
            <option>공지</option>
            <option>자유</option>
            <option>질문</option>
            <option>정보</option>
            <option>이벤트</option>
          </select>
        </div>
        <div>
          <label>제목:</label>
          <input name="title" value={newPost.title} onChange={handleChange} placeholder="제목 입력" />
        </div>

        <div>
          <label>내용 (WYSIWYG Editor):</label>
          {editor && (
            <>
              <div className="toolbar" style={{ marginBottom: '10px' }}>
                <select onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}>
                  <option value="">글꼴</option>
                  <option value="Malgun Gothic">맑은 고딕</option>
                  <option value="Gulim">굴림</option>
                  <option value="Dotum">돋움</option>
                  <option value="Batang">바탕</option>
                  <option value="Gungsuh">궁서</option>
                </select>
                <select onChange={(e) => editor.commands.setTextAlign(e.target.value)}>
                  <option value="left">좌</option>
                  <option value="center">중앙</option>
                  <option value="right">우</option>
                </select>
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
                <button type="button" onClick={() => {
                  const url = prompt("링크를 입력하세요:")
                  if (url) editor.chain().focus().setLink({ href: url }).run()
                }}>🔗</button>
              </div>
              <EditorContent editor={editor} className="tiptap" style={{ border: '1px solid #ccc', padding: '10px', minHeight: '200px' }} />
            </>
          )}
        </div>

        <div>
          <label>이미지:</label>
          <input type="file" onChange={(e) => {
            const file = e.target.files[0]
            if (file) {
              const reader = new FileReader()
              reader.onloadend = () => {
                setNewPost((prev) => ({ ...prev, image: reader.result }))
                setPreviewImage(reader.result)
              }
              reader.readAsDataURL(file)
            }
          }} />
        </div>

        {previewImage && <img src={previewImage} alt="preview" style={{ width: 200, marginTop: 10 }} />}

        <button type="submit">게시물 등록</button>
      </form>
    </div>
  )
}

export default AddPost
