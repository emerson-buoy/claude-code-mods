import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const model = atom({ plugin: 'model-badge', key: 'model' } as const, null)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const current = await $.session.model()
    await update($, model, () => current)

    return next(e)
  })

  on('classic.PostModelSwitch', async ($, e, next) => {
    await update($, model, () => e.to_model)

    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const current = await read($, model)

    if (current === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>Model: </Text>
        <Text bold color="claude">
          {current}
        </Text>
      </Box>
    )
  })
}
