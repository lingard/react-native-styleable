import R from 'ramda'

const flattenStyleSheets = R.compose(
  R.reduce(
    R.mergeWith(
      (a, b) => {
        if (R.is(Array, a) && R.is(Array, b)) {
          return R.union(a, b)
        }

        if (R.is(Array, a) && !R.is(Array, b)) {
          return R.append(b, a)
        }

        if (R.is(Array, b) && !R.is(Array, a)) {
          return R.append(a, b)
        }

        return [a, b]
      }
    ),
    {}
  ),
  R.filter(identity),
  R.flatten
)

export default flattenStyleSheets
