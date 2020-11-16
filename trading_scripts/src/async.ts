export async function runConcurrently<I, O>(
  inputs: I[],
  f: (input: I) => Promise<O>,
  { maxConcurrency }: { maxConcurrency: number },
): Promise<O[]> {
  let nextIndex = 0;
  const promises: Promise<void>[] = [];
  const results: O[] = new Array(inputs.length);
  for (let i = 0; i < maxConcurrency; i++) {
    promises.push(
      (async () => {
        while (nextIndex < inputs.length) {
          const index = nextIndex++;
          const result = await f(inputs[index]);
          results[index] = result;
        }
      })(),
    );
  }
  await Promise.all(promises);
  return results;
}
