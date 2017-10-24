export type Theme = {
  getColor: (...path: Array<string>) => ?string
}

export type Themes = {
  [name: string]: Theme
}
