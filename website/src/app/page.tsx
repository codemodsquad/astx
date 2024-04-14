import * as React from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import AstxEditor from '@/components/AstxEditor'

const initTransformCode = `
exports.astx = ({ astx }) => {
  astx.find\`$a + $b\`.replace\`$b + $a\`
}
`

const initSource = `
1 + 2

foo()

3 + 4 + 5 * 6
`

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h1">ASTX Demo</Typography>
        <AstxEditor
          initTransformCode={initTransformCode}
          initSource={initSource}
          sx={{ maxWidth: '100%', width: '100%' }}
        />
      </Box>
    </Container>
  )
}
