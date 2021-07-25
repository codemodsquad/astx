#!/usr/bin/env node

/* eslint-disable no-console */

import yargs from 'yargs'
import transform from './transform'
import init from './init'

yargs.command(transform).command(init).argv
