const DEFAULT_BATCH_SIZE = 10;

export function getConfiguredBatchSize(): number {
  const configuredBatchSize = Number(process.env.AI_BATCH_SIZE);

  if (Number.isInteger(configuredBatchSize) && configuredBatchSize > 0) {
    return configuredBatchSize;
  }

  return DEFAULT_BATCH_SIZE;
}
