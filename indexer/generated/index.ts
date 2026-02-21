/*
 * Local compile-time stub for `generated` imports.
 * Envio codegen replaces this with strongly-typed bindings.
 */
type GenericHandler = (handler: (args: any) => Promise<void> | void) => void;

function contractProxy(): any {
  return new Proxy(
    {},
    {
      get() {
        const h: { handler: GenericHandler } = {
          handler: () => {
            // no-op stub
          },
        };
        return h;
      },
    }
  );
}

export const IssuanceRegistry = contractProxy();
export const PolicyRegistry = contractProxy();
export const TokenisationEngine = contractProxy();
export const RwaToken1155 = contractProxy();
