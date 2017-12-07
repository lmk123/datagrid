// 让 TypeScript 编译器将 html 后缀的模块视为 string 类型
declare module '*.html' {
  const s: string
  export default s
}
