import { Action, ActionData } from '../model/action';

export abstract class BaseProvider {
  protected constructor(public readonly analyticId: string) {}

  public abstract send(action: Action, data: ActionData): void;
}
