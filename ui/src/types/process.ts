export type TimelinePhase =
  | 'idle'
  | 'signing'
  | 'broadcasting'
  | 'included'
  | 'finalized'
  | 'error';

export type TransactionStatus = TimelinePhase;
