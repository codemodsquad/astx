import { findReplaceTestcase } from '../findReplaceTestcase'
import dedent from 'dedent-js'

findReplaceTestcase({
  file: __filename,
  input: dedent`
    expect(
      new ReduxFormMaterialUICheckbox({
        input: {
          name: 'myCheckbox',
          onChange: noop,
          value: true,
        },
      }).render()
    ).toEqualJSX(<Checkbox name="myCheckbox" checked onChange={noop} />)
  `,
  find: dedent`
  expect(new $X({$$props}).render()).toEqualJSX(<$C $$props2 />)  
  `,
  replace: dedent`
  expect(create(<$X $$props />).root.findByType($C).props).to.containSubset({ $$props2 }) 
  `,
  expectedReplace: dedent`
    expect(
      create(
        <ReduxFormMaterialUICheckbox
          input={{
            name: 'myCheckbox',
            onChange: noop,
            value: true,
          }}
        />
      ).root.findByType(Checkbox).props
    ).to.containSubset({
      name: "myCheckbox",
      checked: true,
      onChange: noop,
    })
  `,
})
