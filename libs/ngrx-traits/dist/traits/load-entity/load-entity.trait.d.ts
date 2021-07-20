import { ActionCreatorProps } from '@ngrx/store/src/models';
import { LoadEntityState } from './load-entity.model';
declare type RecordEntity<T> = T extends Record<string, infer J> ? J : never;
/**
 * Generates ngrx code needed to load and entity and store it in a state
 * @param entityName - Entity name, should be in camel case
 * @param options.actionProps - Optional param for the main request action,
 * use the props() function for its value, if not present action will have no params,
 * @param options.actionSuccessProps - Optional param for the request success
 * action, use the props() function for its value, if not present action success will have no params
 * @param options.actionFailProps - Optional param for the request fail action,
 * use the props() function for its value, if not present action fail will have no params
 * @returns the trait factory
 *
 * @example
 * const traits = createEntityFeatureFactory(
 * ...addLoadEntity({
 *        entityName: 'client',
 *        requestProps: props<{ id: string }>(),
 *        responseProps: props<{ client: Client }>(),
 *      }),
 * )({
 *      actionsGroupKey: 'Client',
 *      featureSelector: createFeatureSelector<
 *        LoadEntityState<Client, 'client'>
 *        >('client'),
 *    });
 *
 * // will generate
 * traits.actions.loadClient({id:123});
 * traits.actions.loadClientSuccess({client: {id: '123', name: 'gabs'}});
 * traits.actions.loadClientFail();
 * traits.selectors.selectClient
 * traits.selectors.isLoadingLoadClient
 * traits.selectors.isSuccessLoadClient
 * traits.selectors.isFailLoadClient
 */
export declare function addLoadEntity<
  J extends string,
  Request extends object | undefined = undefined,
  Response extends Record<J, any> | undefined = undefined,
  Failure extends object | undefined = undefined,
  Entity = RecordEntity<Response>,
  State = LoadEntityState<Entity, J>
>({
  entityName,
  actionProps,
  actionSuccessProps,
  actionFailProps,
}: {
  entityName: J;
  actionProps?: ActionCreatorProps<Request>;
  actionSuccessProps?: ActionCreatorProps<Response>;
  actionFailProps?: ActionCreatorProps<Failure>;
}): readonly [
  import('../../../dist/model').TraitFactory<
    import('../../../dist/model').PrefixProps<
      import('..').StatusState,
      `load${Capitalize<J & string>}`
    >,
    import('../../../dist/model').PrefixProps<
      {
        '': import('..').ActionCreatorWithOptionalProps<Request>;
        Success: import('..').ActionCreatorWithOptionalProps<Response>;
        Fail: import('..').ActionCreatorWithOptionalProps<Failure>;
      },
      `load${Capitalize<J & string>}`
    >,
    import('../../../dist/model').PostfixProps<
      {
        isLoading: (
          state: import('../../../dist/model').PrefixProps<
            import('..').StatusState,
            `load${Capitalize<J & string>}`
          >
        ) => boolean;
        isSuccess: (
          state: import('../../../dist/model').PrefixProps<
            import('..').StatusState,
            `load${Capitalize<J & string>}`
          >
        ) => boolean;
        isFail: (
          state: import('../../../dist/model').PrefixProps<
            import('..').StatusState,
            `load${Capitalize<J & string>}`
          >
        ) => boolean;
      },
      `load${Capitalize<J & string>}`
    >,
    import('../../../dist/model').TraitStateMutators<
      import('../../../dist/model').PrefixProps<
        import('..').StatusState,
        `load${Capitalize<J & string>}`
      >
    >,
    string,
    {
      name: `load${Capitalize<J & string>}`;
      actionProps: ActionCreatorProps<Request>;
      actionSuccessProps: ActionCreatorProps<Response>;
      actionFailProps: ActionCreatorProps<Failure>;
    },
    import('../../../dist/model').AllTraitConfigs
  >,
  import('../../../dist/model').TraitFactory<
    State,
    import('../../../dist/model').TraitActions,
    import('../../../dist/model').PostfixProps<
      {
        select: (state: LoadEntityState<Entity, J>) => Entity;
      },
      J
    >,
    import('../../../dist/model').TraitStateMutators<State>,
    string,
    {
      entityName: J;
      actionProps: ActionCreatorProps<Request>;
      actionSuccessProps: ActionCreatorProps<Response>;
      actionFailProps: ActionCreatorProps<Failure>;
    },
    import('../../../dist/model').AllTraitConfigs
  >
];
export {};
