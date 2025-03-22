export interface User {
    id: number
    email: string
    name: string
    avatar: string
    [key: string]: any
}
  
export interface RegisterData {
    username: string
    email: string
    password: string
}