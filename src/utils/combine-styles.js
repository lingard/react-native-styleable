import R from 'ramda'
import memoize from 'memoizee'
import { isNotNil } from '@utils'
import flattenStyleSheets from './flatten-stylesheets'

// getPropDendencies :: <styleCreator> -> <String>
const getPropDendencies = R.compose(
  R.flatten,
  R.map(R.prop('props'))
)

const reduceStyles = R.curry((props, theme, styleCreators) =>
  R.map(R.apply(R.__, [props, theme]), styleCreators)
)

export default function combineStyles(...styles) {
  const [
    propDependentStyleCreators,
    styleCreators
  ] = R.partition(R.has('props'), styles)

  /**
   * TODO: Add support for multiple prop dependencies
   *       Maybe we could use styleCreator.length !== 1 do determine if the function
   *       depends on props.
   */
  const propDependentStylesByProp = R.indexBy(
    R.compose(R.head, R.prop('props')),
    propDependentStyleCreators
  )

  const propDeps = getPropDendencies(propDependentStyleCreators)

  const pickStyles = memoize((p, theme) => {
    const props = JSON.parse(p)
    const propKeys = R.keys(props)
    const propStyleCreators = R.values(
      R.pick(propKeys, propDependentStylesByProp)
    )

    const styles = reduceStyles(props, theme, R.concat(
      styleCreators,
      propStyleCreators
    ))

    return flattenStyleSheets(styles)
  })

  const createStyles = (props, theme = 'default') => {
    const truthyProps = R.pickBy(isNotNil, props)
    const styles = pickStyles(JSON.stringify(truthyProps), theme)

    return styles
  }

  createStyles.props = propDeps

  return createStyles
}
