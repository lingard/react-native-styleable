const createThemeVariable = (resolver) =>
  (...args) => {
    function resolve(theme) {
      return resolver(theme, ...args)
    }

    // TODO: Use something else to identify that it's a theme var, maybe a symbol
    resolve.variable = true

    return resolve
  }

export default createThemeVariable
