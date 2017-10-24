import R from 'ramda'
import { StyleSheet } from 'react-native'

// isThemeVariable :: Any -> Boolean
const isThemeVariable = R.allPass([
  R.is(Object),
  R.prop('variable')
])

// hasThemeDependencies :: Object -> Boolean
const hasThemeDependencies = R.compose(
  R.map(
    R.compose(
      R.any(isThemeVariable),
      R.values
    )
  ),
  R.values
)

// parseStyle :: Theme -> Object -> Object
const parseStyle = theme => R.map((style) => {
  // Return if it's a stylesheet
  if (R.is(Number, style)) {
    return style
  }

  if (isThemeVariable(style)) {
    return style(theme)
  }

  return style
})

// ParseThemeStyles :: (theme, Object) -> Object
const parseThemeStyles = (theme, styles) =>
  R.map(parseStyle(theme), styles)

const createStylesParser = (themes) => {
  const themeNames = R.keys(themes)

  // createSharedStyles :: Object -> Object
  const createSharedStyles = styleSheet => R.compose(
    R.mergeAll,
    R.map(R.objOf(R.__, styleSheet)),
   )(themeNames)

  return styles => {
    // Return if all styles are stylesheets
    if (R.all(R.is(Number), R.values(styles))) {
      return createSharedStyles(styles)
    }

    if (!hasThemeDependencies(styles)) {
      const styleSheet = StyleSheet.create(styles)

      return createSharedStyles(styleSheet)
    }

    return R.mapObjIndexed(
      (theme) =>
        StyleSheet.create(parseThemeStyles(theme, styles)),
      themes
    )
  }
}

export default createStylesParser
