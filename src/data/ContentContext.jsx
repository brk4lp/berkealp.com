import { createContext, useContext } from 'react'
import { photos } from './photos.js'
import { projects } from './projects.js'
import { posts } from './posts.js'

export const ContentContext = createContext({ photos, projects, posts })
export const useContent = () => useContext(ContentContext)
