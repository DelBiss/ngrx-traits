import { createFeatureSelector } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadEntities, EntityAndStatusState } from '../load-entities';
import { addFilter } from '../filter/filter.trait';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { Actions } from '@ngrx/effects';
import { of } from 'rxjs';
import { first, take, toArray } from 'rxjs/operators';
import { addPagination, PaginationState } from '../pagination';
import { provideMockActions } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { hot, Scheduler } from 'jest-marbles';
import { ƟFilterActions } from './filter.model.internal';
import { FilterState } from 'ngrx-traits/traits';


export interface TestState
  extends EntityAndStatusState<Todo>,
    PaginationState , FilterState<TodoFilter>{}
export interface TestState2
  extends EntityAndStatusState<Todo>,
    FilterState<TodoFilter> {}

describe('addFilter Trait', () => {
  let actions$: Actions;

  function initWithRemoteFilter() {
    const featureSelector = createFeatureSelector<TestState2>('test');
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>(),
      addFilter<Todo, TodoFilter>()
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });
    TestBed.configureTestingModule({
      providers: [
        traits.effects[0],
        provideMockActions(() => actions$),
        provideMockStore(),
      ],
    });
    const mockStore = TestBed.inject(MockStore);
    return { ...traits, effects: TestBed.inject(traits.effects[0]), mockStore };
  }

  function initWithRemoteFilterWithPagination() {
    const featureSelector = createFeatureSelector<TestState>('test');
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>(),
      addFilter<Todo, TodoFilter>(),
      addPagination<Todo>()
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });
    TestBed.configureTestingModule({
      providers: [
        traits.effects[1],
        provideMockActions(() => actions$),
        provideMockStore(),
      ],
    });
    return { ...traits, effects: TestBed.inject(traits.effects[1]) };
  }

  // note: local filtering test are in load-entities and pagination traits because most logic belongs there

  describe('reducer', () => {
    it('should storeFilter action should store filters', () => {
      const { reducer, actions, initialState } = initWithRemoteFilter();
      const state = reducer(
        initialState,
        (actions as unknown as ƟFilterActions<TodoFilter>).storeFilter({
          filters: { content: 'x' },
        })
      );
      expect(state.filters).toEqual({ content: 'x' });
    });
  });

  describe('selectors', () => {
    it('selectFilter should return stored filter', () => {
      const { reducer, actions, initialState, selectors } =
        initWithRemoteFilter();
      selectors.selectFilter.projector;
      const state = reducer(
        initialState,
        (actions as unknown as ƟFilterActions<TodoFilter>).storeFilter({
          filters: { content: 'x' },
        })
      );
      expect(selectors.selectFilter.projector(state)).toEqual({ content: 'x' });
    });
  });

  describe('effects', () => {
    it('should fire fetch when storeFilter is fired and no pagination', async () => {
      const { effects, actions } = initWithRemoteFilter();
      actions$ = of(
        (actions as unknown as ƟFilterActions<TodoFilter>).storeFilter({
          filters: { content: 'x' },
        })
      );
      const action = await effects.fetch$.pipe(first()).toPromise();
      expect(action).toEqual(actions.fetch());
    });

    it('should fire loadFirstPage when storeFilter is fired and has pagination', async () => {
      const { effects, actions } = initWithRemoteFilterWithPagination();
      actions$ = of(
        (actions as unknown as ƟFilterActions<TodoFilter>).storeFilter({
          filters: { content: 'x' },
        })
      );
      const action = await effects.fetch$.pipe(take(2), toArray()).toPromise();
      expect(action).toEqual([
        actions.clearPagesCache(),
        actions.loadFirstPage(),
      ]);
    });
    describe('storeFilter$', () => {
      it('should fire immediately  storeFilter action after filter if forceLoad is true', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilter();
        mockStore.overrideSelector(selectors.selectFilter, {});
        actions$ = of(
          actions.filter({ filters: { content: 'x' }, forceLoad: true })
        );
        const action = await effects
          .storeFilter$({
            debounce: 30,
            scheduler: Scheduler.get(),
          })
          .pipe(take(1))
          .toPromise();
        expect(action).toEqual(
          (actions as unknown as ƟFilterActions<TodoFilter>).storeFilter({
            filters: { content: 'x' },
          })
        );
      });

      it('should fire a debounced storeFilter action after filter action is fired', () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilter();
        mockStore.overrideSelector(selectors.selectFilter, {});
        actions$ = hot('a-b', {
          a: actions.filter({ filters: { content: 'x' } }),
          b: actions.filter({ filters: { content: 'y' } }),
        });
        const expected = hot('-----b', {
          b: (actions as unknown as ƟFilterActions<TodoFilter>).storeFilter({
            filters: { content: 'y' },
          }),
        });
        expect(
          effects.storeFilter$({
            debounce: 30,
            scheduler: Scheduler.get(),
          })
        ).toBeObservable(expected);
      });

      it('should not fire  storeFilter action after filter if payload is the same as before', () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilter();
        mockStore.overrideSelector(selectors.selectFilter, {});
        actions$ = hot('a----a', {
          a: actions.filter({ filters: { content: 'x' } }),
        });
        const expected = hot('---a', {
          a: (actions as unknown as ƟFilterActions<TodoFilter>).storeFilter({
            filters: { content: 'x' },
          }),
        });
        expect(
          effects.storeFilter$({
            debounce: 30,
            scheduler: Scheduler.get(),
          })
        ).toBeObservable(expected);
      });

      it.todo(
        'should merge current filters with passed filters when patch is true'
      );
    });
  });
});
