import add, { AddParams } from './add'
import checkout, { CheckoutParams } from './checkout'
import update, { UpdateParams } from './update'
import status, { StatusParams } from './status'
import propset, { PropSetParams } from './propset'
import remove, { RemoveParams } from './remove'
import commit, { CommitParams } from './commit'
import copy, { CopyParams } from './copy'

export type {
  AddParams,
  CheckoutParams,
  UpdateParams,
  StatusParams,
  PropSetParams,
  RemoveParams,
  CommitParams,
  CopyParams
}
export default { add, checkout, update, status, propset, remove, commit, copy }
