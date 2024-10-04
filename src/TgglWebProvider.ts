import {
  EvaluationContext,
  JsonValue,
  Logger,
  OpenFeatureEventEmitter,
  Provider,
  ResolutionDetails,
  ClientProviderEvents,
} from '@openfeature/web-sdk'
import { TgglClient, TgglContext } from 'tggl-client'
import { AnyProviderEvent, ProviderEventEmitter } from '@openfeature/core'

export class TgglWebProvider implements Provider {
  public readonly runsOn = 'client'
  readonly metadata = {
    name: 'Tggl',
  } as const
  public readonly client: TgglClient
  events: ProviderEventEmitter<AnyProviderEvent>

  constructor(
    apiKey?: ConstructorParameters<typeof TgglClient>[0],
    options?: ConstructorParameters<typeof TgglClient>[1]
  ) {
    this.client = new TgglClient(apiKey, options)

    this.events = new OpenFeatureEventEmitter()

    this.client.onResultChange(() => {
      this.events.emit(ClientProviderEvents.ConfigurationChanged)
    })
  }

  async initialize(context?: EvaluationContext): Promise<void> {
    await this.client.setContext(context as TgglContext)
  }

  async onClose(): Promise<void> {
    this.client.stopPolling()
  }

  async onContextChange(
    oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> {
    await this.client.setContext(newContext as TgglContext)
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<boolean> {
    return {
      value: Boolean(this.client.get(flagKey, defaultValue)),
    }
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<string> {
    return {
      value: String(this.client.get(flagKey, defaultValue)),
    }
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<number> {
    return {
      value: Number(this.client.get(flagKey, defaultValue)),
    }
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<T> {
    return {
      value: this.client.get(flagKey, defaultValue),
    }
  }
}
