/***** TAKE NOTE ******
This is a hack to get genType to work!

In order for genType to produce recursive types, it needs to be at the 
root module of a file. If it's defined in a nested module it does not 
work. So all the MockDb types and internal functions are defined in TestHelpers_MockDb
and only public functions are recreated and exported from this module.

the following module:
```rescript
module MyModule = {
  @genType
  type rec a = {fieldB: b}
  @genType and b = {fieldA: a}
}
```

produces the following in ts:
```ts
// tslint:disable-next-line:interface-over-type-literal
export type MyModule_a = { readonly fieldB: b };

// tslint:disable-next-line:interface-over-type-literal
export type MyModule_b = { readonly fieldA: MyModule_a };
```

fieldB references type b which doesn't exist because it's defined
as MyModule_b
*/

module MockDb = {
  @genType
  let createMockDb = TestHelpers_MockDb.createMockDb
}

@genType
module Addresses = {
  include TestHelpers_MockAddresses
}

module EventFunctions = {
  //Note these are made into a record to make operate in the same way
  //for Res, JS and TS.

  /**
  The arguements that get passed to a "processEvent" helper function
  */
  @genType
  type eventProcessorArgs<'event> = {
    event: 'event,
    mockDb: TestHelpers_MockDb.t,
    @deprecated("Set the chainId for the event instead")
    chainId?: int,
  }

  @genType
  type eventProcessor<'event> = eventProcessorArgs<'event> => promise<TestHelpers_MockDb.t>

  /**
  A function composer to help create individual processEvent functions
  */
  let makeEventProcessor = (~register) => args => {
    let {event, mockDb, ?chainId} =
      args->(Utils.magic: eventProcessorArgs<'event> => eventProcessorArgs<Internal.event>)

    // Have the line here, just in case the function is called with
    // a manually created event. We don't want to break the existing tests here.
    let _ =
      TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    TestHelpers_MockDb.makeProcessEvents(mockDb, ~chainId=?chainId)([event->(Utils.magic: Internal.event => Types.eventLog<unknown>)])
  }

  module MockBlock = {
    @genType
    type t = {
      hash?: string,
      number?: int,
      timestamp?: int,
    }

    let toBlock = (_mock: t) => {
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      number: _mock.number->Belt.Option.getWithDefault(0),
      timestamp: _mock.timestamp->Belt.Option.getWithDefault(0),
    }->(Utils.magic: Types.AggregatedBlock.t => Internal.eventBlock)
  }

  module MockTransaction = {
    @genType
    type t = {
    }

    let toTransaction = (_mock: t) => {
    }->(Utils.magic: Types.AggregatedTransaction.t => Internal.eventTransaction)
  }

  @genType
  type mockEventData = {
    chainId?: int,
    srcAddress?: Address.t,
    logIndex?: int,
    block?: MockBlock.t,
    transaction?: MockTransaction.t,
  }

  /**
  Applies optional paramters with defaults for all common eventLog field
  */
  let makeEventMocker = (
    ~params: Internal.eventParams,
    ~mockEventData: option<mockEventData>,
    ~register: unit => Internal.eventConfig,
  ): Internal.event => {
    let {?block, ?transaction, ?srcAddress, ?chainId, ?logIndex} =
      mockEventData->Belt.Option.getWithDefault({})
    let block = block->Belt.Option.getWithDefault({})->MockBlock.toBlock
    let transaction = transaction->Belt.Option.getWithDefault({})->MockTransaction.toTransaction
    let event: Internal.event = {
      params,
      transaction,
      chainId: switch chainId {
      | Some(chainId) => chainId
      | None =>
        switch Generated.configWithoutRegistrations.defaultChain {
        | Some(chainConfig) => chainConfig.id
        | None =>
          Js.Exn.raiseError(
            "No default chain Id found, please add at least 1 chain to your config.yaml",
          )
        }
      },
      block,
      srcAddress: srcAddress->Belt.Option.getWithDefault(Addresses.defaultAddress),
      logIndex: logIndex->Belt.Option.getWithDefault(0),
    }
    // Since currently it's not possible to figure out the event config from the event
    // we store a reference to the register function by event in a weak map
    let _ = TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    event
  }
}


module ConfidentialSettlement = {
  module EngineAddressUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ConfidentialSettlement.EngineAddressUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ConfidentialSettlement.EngineAddressUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.ConfidentialSettlement.EngineAddressUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ConfidentialSettlement.EngineAddressUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ConfidentialSettlement.EngineAddressUpdated.event)
    }
  }

  module Initialized = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ConfidentialSettlement.Initialized.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ConfidentialSettlement.Initialized.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.ConfidentialSettlement.Initialized.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ConfidentialSettlement.Initialized.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ConfidentialSettlement.Initialized.event)
    }
  }

  module NoteClaimed = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ConfidentialSettlement.NoteClaimed.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ConfidentialSettlement.NoteClaimed.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: string,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault("foo"),
      }
->(Utils.magic: Types.ConfidentialSettlement.NoteClaimed.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ConfidentialSettlement.NoteClaimed.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ConfidentialSettlement.NoteClaimed.event)
    }
  }

  module NoteCommitted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ConfidentialSettlement.NoteCommitted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ConfidentialSettlement.NoteCommitted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: bigint,
      @as("_2")
      _2?: bigint,
      @as("_3")
      _3?: bigint,
      @as("_4")
      _4?: Address.t,
      @as("_5")
      _5?: bigint,
      @as("_6")
      _6?: string,
      @as("_7")
      _7?: string,
      @as("_8")
      _8?: string,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?_5,
        ?_6,
        ?_7,
        ?_8,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault(0n),
       _2: _2->Belt.Option.getWithDefault(0n),
       _3: _3->Belt.Option.getWithDefault(0n),
       _4: _4->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _5: _5->Belt.Option.getWithDefault(0n),
       _6: _6->Belt.Option.getWithDefault("foo"),
       _7: _7->Belt.Option.getWithDefault("foo"),
       _8: _8->Belt.Option.getWithDefault("foo"),
      }
->(Utils.magic: Types.ConfidentialSettlement.NoteCommitted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ConfidentialSettlement.NoteCommitted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ConfidentialSettlement.NoteCommitted.event)
    }
  }

  module OwnershipTransferStarted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ConfidentialSettlement.OwnershipTransferStarted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ConfidentialSettlement.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.ConfidentialSettlement.OwnershipTransferStarted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ConfidentialSettlement.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ConfidentialSettlement.OwnershipTransferStarted.event)
    }
  }

  module OwnershipTransferred = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ConfidentialSettlement.OwnershipTransferred.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ConfidentialSettlement.OwnershipTransferred.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.ConfidentialSettlement.OwnershipTransferred.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ConfidentialSettlement.OwnershipTransferred.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ConfidentialSettlement.OwnershipTransferred.event)
    }
  }

  module Upgraded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.ConfidentialSettlement.Upgraded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.ConfidentialSettlement.Upgraded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.ConfidentialSettlement.Upgraded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.ConfidentialSettlement.Upgraded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.ConfidentialSettlement.Upgraded.event)
    }
  }

}


module IssuanceRegistry = {
  module EngineAddressUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.EngineAddressUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.EngineAddressUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.IssuanceRegistry.EngineAddressUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.EngineAddressUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.EngineAddressUpdated.event)
    }
  }

  module Initialized = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.Initialized.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.Initialized.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.IssuanceRegistry.Initialized.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.Initialized.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.Initialized.event)
    }
  }

  module IssuanceRequestCancelled = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.IssuanceRequestCancelled.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.IssuanceRequestCancelled.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.IssuanceRegistry.IssuanceRequestCancelled.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.IssuanceRequestCancelled.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.IssuanceRequestCancelled.event)
    }
  }

  module IssuanceRequestConsumed = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.IssuanceRequestConsumed.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.IssuanceRequestConsumed.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.IssuanceRegistry.IssuanceRequestConsumed.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.IssuanceRequestConsumed.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.IssuanceRequestConsumed.event)
    }
  }

  module IssuanceRequestCreated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.IssuanceRequestCreated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.IssuanceRequestCreated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: string,
      @as("_2")
      _2?: Address.t,
      @as("_3")
      _3?: Address.t,
      @as("_4")
      _4?: bigint,
      @as("_5")
      _5?: Address.t,
      @as("_6")
      _6?: bigint,
      @as("_7")
      _7?: bigint,
      @as("_8")
      _8?: string,
      @as("_9")
      _9?: string,
      @as("_10")
      _10?: string,
      @as("_11")
      _11?: bigint,
      @as("_12")
      _12?: string,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?_5,
        ?_6,
        ?_7,
        ?_8,
        ?_9,
        ?_10,
        ?_11,
        ?_12,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault("foo"),
       _2: _2->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _3: _3->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _4: _4->Belt.Option.getWithDefault(0n),
       _5: _5->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _6: _6->Belt.Option.getWithDefault(0n),
       _7: _7->Belt.Option.getWithDefault(0n),
       _8: _8->Belt.Option.getWithDefault("foo"),
       _9: _9->Belt.Option.getWithDefault("foo"),
       _10: _10->Belt.Option.getWithDefault("foo"),
       _11: _11->Belt.Option.getWithDefault(0n),
       _12: _12->Belt.Option.getWithDefault("foo"),
      }
->(Utils.magic: Types.IssuanceRegistry.IssuanceRequestCreated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.IssuanceRequestCreated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.IssuanceRequestCreated.event)
    }
  }

  module IssuanceRequestPrivacyBound = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.IssuanceRequestPrivacyBound.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.IssuanceRequestPrivacyBound.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: bigint,
      @as("_2")
      _2?: string,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault(0n),
       _2: _2->Belt.Option.getWithDefault("foo"),
      }
->(Utils.magic: Types.IssuanceRegistry.IssuanceRequestPrivacyBound.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.IssuanceRequestPrivacyBound.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.IssuanceRequestPrivacyBound.event)
    }
  }

  module PaymentRegistryUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.PaymentRegistryUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.PaymentRegistryUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.IssuanceRegistry.PaymentRegistryUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.PaymentRegistryUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.PaymentRegistryUpdated.event)
    }
  }

  module WorkerPrivacyConfigurationUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: bigint,
      @as("_2")
      _2?: string,
      @as("_3")
      _3?: string,
      @as("_4")
      _4?: string,
      @as("_5")
      _5?: bigint,
      @as("_6")
      _6?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?_5,
        ?_6,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(0n),
       _2: _2->Belt.Option.getWithDefault("foo"),
       _3: _3->Belt.Option.getWithDefault("foo"),
       _4: _4->Belt.Option.getWithDefault("foo"),
       _5: _5->Belt.Option.getWithDefault(0n),
       _6: _6->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated.event)
    }
  }

  module OwnershipTransferStarted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.OwnershipTransferStarted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.IssuanceRegistry.OwnershipTransferStarted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.OwnershipTransferStarted.event)
    }
  }

  module OwnershipTransferred = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.OwnershipTransferred.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.OwnershipTransferred.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.IssuanceRegistry.OwnershipTransferred.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.OwnershipTransferred.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.OwnershipTransferred.event)
    }
  }

  module Upgraded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.IssuanceRegistry.Upgraded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.IssuanceRegistry.Upgraded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.IssuanceRegistry.Upgraded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.IssuanceRegistry.Upgraded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.IssuanceRegistry.Upgraded.event)
    }
  }

}


module PaymentRegistry = {
  module Initialized = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PaymentRegistry.Initialized.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PaymentRegistry.Initialized.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PaymentRegistry.Initialized.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PaymentRegistry.Initialized.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PaymentRegistry.Initialized.event)
    }
  }

  module OwnershipTransferStarted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PaymentRegistry.OwnershipTransferStarted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PaymentRegistry.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.PaymentRegistry.OwnershipTransferStarted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PaymentRegistry.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PaymentRegistry.OwnershipTransferStarted.event)
    }
  }

  module OwnershipTransferred = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PaymentRegistry.OwnershipTransferred.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PaymentRegistry.OwnershipTransferred.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.PaymentRegistry.OwnershipTransferred.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PaymentRegistry.OwnershipTransferred.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PaymentRegistry.OwnershipTransferred.event)
    }
  }

  module ParticipantProfileUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PaymentRegistry.ParticipantProfileUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PaymentRegistry.ParticipantProfileUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: string,
      @as("_2")
      _2?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault("foo"),
       _2: _2->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PaymentRegistry.ParticipantProfileUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PaymentRegistry.ParticipantProfileUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PaymentRegistry.ParticipantProfileUpdated.event)
    }
  }

  module ParticipantRoleUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PaymentRegistry.ParticipantRoleUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PaymentRegistry.ParticipantRoleUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: bigint,
      @as("_2")
      _2?: bool,
      @as("_3")
      _3?: bigint,
      @as("_4")
      _4?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(0n),
       _2: _2->Belt.Option.getWithDefault(false),
       _3: _3->Belt.Option.getWithDefault(0n),
       _4: _4->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PaymentRegistry.ParticipantRoleUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PaymentRegistry.ParticipantRoleUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PaymentRegistry.ParticipantRoleUpdated.event)
    }
  }

  module ParticipantStatusUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PaymentRegistry.ParticipantStatusUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PaymentRegistry.ParticipantStatusUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: bool,
      @as("_2")
      _2?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(false),
       _2: _2->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PaymentRegistry.ParticipantStatusUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PaymentRegistry.ParticipantStatusUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PaymentRegistry.ParticipantStatusUpdated.event)
    }
  }

  module Upgraded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PaymentRegistry.Upgraded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PaymentRegistry.Upgraded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.PaymentRegistry.Upgraded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PaymentRegistry.Upgraded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PaymentRegistry.Upgraded.event)
    }
  }

}


module PolicyRegistry = {
  module ActivePolicyIdentifierUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PolicyRegistry.ActivePolicyIdentifierUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PolicyRegistry.ActivePolicyIdentifierUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PolicyRegistry.ActivePolicyIdentifierUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PolicyRegistry.ActivePolicyIdentifierUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PolicyRegistry.ActivePolicyIdentifierUpdated.event)
    }
  }

  module Initialized = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PolicyRegistry.Initialized.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PolicyRegistry.Initialized.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PolicyRegistry.Initialized.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PolicyRegistry.Initialized.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PolicyRegistry.Initialized.event)
    }
  }

  module OwnershipTransferStarted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PolicyRegistry.OwnershipTransferStarted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PolicyRegistry.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.PolicyRegistry.OwnershipTransferStarted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PolicyRegistry.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PolicyRegistry.OwnershipTransferStarted.event)
    }
  }

  module OwnershipTransferred = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PolicyRegistry.OwnershipTransferred.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PolicyRegistry.OwnershipTransferred.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.PolicyRegistry.OwnershipTransferred.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PolicyRegistry.OwnershipTransferred.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PolicyRegistry.OwnershipTransferred.event)
    }
  }

  module PolicyCreated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PolicyRegistry.PolicyCreated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PolicyRegistry.PolicyCreated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: string,
      @as("_2")
      _2?: string,
      @as("_3")
      _3?: bigint,
      @as("_4")
      _4?: bigint,
      @as("_5")
      _5?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?_5,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault("foo"),
       _2: _2->Belt.Option.getWithDefault("foo"),
       _3: _3->Belt.Option.getWithDefault(0n),
       _4: _4->Belt.Option.getWithDefault(0n),
       _5: _5->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PolicyRegistry.PolicyCreated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PolicyRegistry.PolicyCreated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PolicyRegistry.PolicyCreated.event)
    }
  }

  module PolicyDeprecated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PolicyRegistry.PolicyDeprecated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PolicyRegistry.PolicyDeprecated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PolicyRegistry.PolicyDeprecated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PolicyRegistry.PolicyDeprecated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PolicyRegistry.PolicyDeprecated.event)
    }
  }

  module PolicyPrivacyConstraintsUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: bool,
      @as("_2")
      _2?: bool,
      @as("_3")
      _3?: bool,
      @as("_4")
      _4?: bool,
      @as("_5")
      _5?: bool,
      @as("_6")
      _6?: bool,
      @as("_7")
      _7?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?_5,
        ?_6,
        ?_7,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault(false),
       _2: _2->Belt.Option.getWithDefault(false),
       _3: _3->Belt.Option.getWithDefault(false),
       _4: _4->Belt.Option.getWithDefault(false),
       _5: _5->Belt.Option.getWithDefault(false),
       _6: _6->Belt.Option.getWithDefault(false),
       _7: _7->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated.event)
    }
  }

  module Upgraded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.PolicyRegistry.Upgraded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.PolicyRegistry.Upgraded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.PolicyRegistry.Upgraded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.PolicyRegistry.Upgraded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.PolicyRegistry.Upgraded.event)
    }
  }

}


module RwaToken1155 = {
  module ApprovalForAll = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.ApprovalForAll.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.ApprovalForAll.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      @as("_2")
      _2?: bool,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _2: _2->Belt.Option.getWithDefault(false),
      }
->(Utils.magic: Types.RwaToken1155.ApprovalForAll.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.ApprovalForAll.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.ApprovalForAll.event)
    }
  }

  module ContractURIUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.ContractURIUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.ContractURIUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: string,
      @as("_1")
      _1?: string,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault("foo"),
       _1: _1->Belt.Option.getWithDefault("foo"),
      }
->(Utils.magic: Types.RwaToken1155.ContractURIUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.ContractURIUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.ContractURIUpdated.event)
    }
  }

  module EngineAddressUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.EngineAddressUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.EngineAddressUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.RwaToken1155.EngineAddressUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.EngineAddressUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.EngineAddressUpdated.event)
    }
  }

  module Initialized = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.Initialized.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.Initialized.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.RwaToken1155.Initialized.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.Initialized.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.Initialized.event)
    }
  }

  module OwnershipTransferStarted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.OwnershipTransferStarted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.RwaToken1155.OwnershipTransferStarted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.OwnershipTransferStarted.event)
    }
  }

  module OwnershipTransferred = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.OwnershipTransferred.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.OwnershipTransferred.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.RwaToken1155.OwnershipTransferred.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.OwnershipTransferred.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.OwnershipTransferred.event)
    }
  }

  module TransferBatch = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.TransferBatch.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.TransferBatch.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      @as("_2")
      _2?: Address.t,
      @as("_3")
      _3?: array<bigint>,
      @as("_4")
      _4?: array<bigint>,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _2: _2->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _3: _3->Belt.Option.getWithDefault([]),
       _4: _4->Belt.Option.getWithDefault([]),
      }
->(Utils.magic: Types.RwaToken1155.TransferBatch.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.TransferBatch.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.TransferBatch.event)
    }
  }

  module TransferSingle = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.TransferSingle.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.TransferSingle.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      @as("_2")
      _2?: Address.t,
      @as("_3")
      _3?: bigint,
      @as("_4")
      _4?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _2: _2->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _3: _3->Belt.Option.getWithDefault(0n),
       _4: _4->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.RwaToken1155.TransferSingle.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.TransferSingle.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.TransferSingle.event)
    }
  }

  module URI = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.URI.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.URI.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: string,
      @as("_1")
      _1?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault("foo"),
       _1: _1->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.RwaToken1155.URI.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.URI.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.URI.event)
    }
  }

  module Upgraded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.RwaToken1155.Upgraded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.RwaToken1155.Upgraded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.RwaToken1155.Upgraded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.RwaToken1155.Upgraded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.RwaToken1155.Upgraded.event)
    }
  }

}


module TokenisationEngine = {
  module Initialized = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.Initialized.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.Initialized.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.TokenisationEngine.Initialized.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.Initialized.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.Initialized.event)
    }
  }

  module IssuanceAuditReceipt = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.IssuanceAuditReceipt.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.IssuanceAuditReceipt.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: bigint,
      @as("_2")
      _2?: bigint,
      @as("_3")
      _3?: string,
      @as("_4")
      _4?: string,
      @as("_5")
      _5?: string,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?_5,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault(0n),
       _2: _2->Belt.Option.getWithDefault(0n),
       _3: _3->Belt.Option.getWithDefault("foo"),
       _4: _4->Belt.Option.getWithDefault("foo"),
       _5: _5->Belt.Option.getWithDefault("foo"),
      }
->(Utils.magic: Types.TokenisationEngine.IssuanceAuditReceipt.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.IssuanceAuditReceipt.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.IssuanceAuditReceipt.event)
    }
  }

  module IssuanceExecuted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.IssuanceExecuted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.IssuanceExecuted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: bigint,
      @as("_1")
      _1?: bigint,
      @as("_2")
      _2?: string,
      @as("_3")
      _3?: string,
      @as("_4")
      _4?: bigint,
      @as("_5")
      _5?: Address.t,
      @as("_6")
      _6?: bigint,
      @as("_7")
      _7?: bigint,
      @as("_8")
      _8?: string,
      @as("_9")
      _9?: string,
      @as("_10")
      _10?: string,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?_2,
        ?_3,
        ?_4,
        ?_5,
        ?_6,
        ?_7,
        ?_8,
        ?_9,
        ?_10,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(0n),
       _1: _1->Belt.Option.getWithDefault(0n),
       _2: _2->Belt.Option.getWithDefault("foo"),
       _3: _3->Belt.Option.getWithDefault("foo"),
       _4: _4->Belt.Option.getWithDefault(0n),
       _5: _5->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _6: _6->Belt.Option.getWithDefault(0n),
       _7: _7->Belt.Option.getWithDefault(0n),
       _8: _8->Belt.Option.getWithDefault("foo"),
       _9: _9->Belt.Option.getWithDefault("foo"),
       _10: _10->Belt.Option.getWithDefault("foo"),
      }
->(Utils.magic: Types.TokenisationEngine.IssuanceExecuted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.IssuanceExecuted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.IssuanceExecuted.event)
    }
  }

  module IssuanceRegistryUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.IssuanceRegistryUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.IssuanceRegistryUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.IssuanceRegistryUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.IssuanceRegistryUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.IssuanceRegistryUpdated.event)
    }
  }

  module OwnershipTransferStarted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.OwnershipTransferStarted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.OwnershipTransferStarted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.OwnershipTransferStarted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.OwnershipTransferStarted.event)
    }
  }

  module OwnershipTransferred = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.OwnershipTransferred.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.OwnershipTransferred.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.OwnershipTransferred.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.OwnershipTransferred.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.OwnershipTransferred.event)
    }
  }

  module PolicyRegistryUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.PolicyRegistryUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.PolicyRegistryUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.PolicyRegistryUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.PolicyRegistryUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.PolicyRegistryUpdated.event)
    }
  }

  module ProgramVerificationKeyUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.ProgramVerificationKeyUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.ProgramVerificationKeyUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: string,
      @as("_1")
      _1?: string,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault("foo"),
       _1: _1->Belt.Option.getWithDefault("foo"),
      }
->(Utils.magic: Types.TokenisationEngine.ProgramVerificationKeyUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.ProgramVerificationKeyUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.ProgramVerificationKeyUpdated.event)
    }
  }

  module RwaTokenUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.RwaTokenUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.RwaTokenUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.RwaTokenUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.RwaTokenUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.RwaTokenUpdated.event)
    }
  }

  module ConfidentialSettlementUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.ConfidentialSettlementUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.ConfidentialSettlementUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.ConfidentialSettlementUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.ConfidentialSettlementUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.ConfidentialSettlementUpdated.event)
    }
  }

  module Sp1VerifierUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.Sp1VerifierUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.Sp1VerifierUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.Sp1VerifierUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.Sp1VerifierUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.Sp1VerifierUpdated.event)
    }
  }

  module UmbraBatchSendUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.UmbraBatchSendUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.UmbraBatchSendUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.UmbraBatchSendUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.UmbraBatchSendUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.UmbraBatchSendUpdated.event)
    }
  }

  module UmbraCoreUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.UmbraCoreUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.UmbraCoreUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      @as("_1")
      _1?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?_1,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _1: _1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.UmbraCoreUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.UmbraCoreUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.UmbraCoreUpdated.event)
    }
  }

  module Upgraded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TokenisationEngine.Upgraded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TokenisationEngine.Upgraded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("_0")
      _0?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?_0,
        ?mockEventData,
      } = args

      let params = 
      {
       _0: _0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TokenisationEngine.Upgraded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TokenisationEngine.Upgraded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TokenisationEngine.Upgraded.event)
    }
  }

}

