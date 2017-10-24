import {
  compose,
  reduce,
  mergeWith,
  map,
  of,
  filter,
  identity,
  union,
  ifElse,
  is,
  append,
  flatten
} from 'ramda'

// // flattenStyleSheets :: <StyleSheet> -> Object
// const flattenStyleSheets = compose(
//   // (style) => {
//   //   console.log("unioned styles", style)
//   //   return style
//   // },
//   reduce(
//     mergeWith(
//       compose(
//         // union,
//         flatten,
//         append
//       )
//     ),
//     {}
//   ),
//   // (style) => {
//   //   console.log("mapped styles", style)
//   //   return style
//   // },
//   // map(
//   //   ifElse(
//   //     is(Array),
//   //     identity,
//   //     map(of)
//   //   )
//   // ),
//   // (style) => {
//   //   console.log("pre mapped styles", style)
//   //   return style
//   // },
//   filter(identity),
// )

const flattenStyleSheets = compose(
  reduce(
    mergeWith(
      (style, style2) => {
        // console.log('----->', acc, styles)
        if (is(Array, style) && is(Array, style2)) {
          return union(style, style2)
        }

        if (is(Array, style) && !is(Array, style2)) {
          return append(style2, style)
        }

        if (is(Array, style2) && !is(Array, style)) {
          return append(style, style2)
        }

        return [style, style2]

        // if (is(Array, styles)) {
        //   return union(acc, styles)
        // }

        // return append(styles, acc)
      }
    ),
    {}
  ),
  filter(identity),
  flatten
)

export default flattenStyleSheets
