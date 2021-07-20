import { createAction } from '@ngrx/store';
export function createCrudTraitActions(actionsGroupKey) {
  return {
    add: createAction(`${actionsGroupKey} Add`, (...entities) => ({
      entities,
    })),
    remove: createAction(`${actionsGroupKey} Remove`, (...keys) => ({
      keys,
    })),
    update: createAction(`${actionsGroupKey} Update`, (...updates) => ({
      updates,
    })),
    upsert: createAction(`${actionsGroupKey} Upsert`, (...entities) => ({
      entities,
    })),
    removeAll: createAction(`${actionsGroupKey} Remove All`, (predicate) => ({
      predicate,
    })),
    clearChanges: createAction(`${actionsGroupKey} Clear Changes`),
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J1ZC50cmFpdC5hY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdHJhaXRzL3NyYy9jcnVkL2NydWQudHJhaXQuYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRzNDLE1BQU0sVUFBVSxzQkFBc0IsQ0FDcEMsZUFBdUI7SUFFdkIsT0FBTztRQUNMLEdBQUcsRUFBRSxZQUFZLENBQUMsR0FBRyxlQUFlLE1BQU0sRUFBRSxDQUFDLEdBQUcsUUFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN0RSxRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxFQUFFLFlBQVksQ0FDbEIsR0FBRyxlQUFlLFNBQVMsRUFDM0IsQ0FBQyxHQUFHLElBQXlCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDakMsSUFBSTtTQUNMLENBQUMsQ0FDSDtRQUNELE1BQU0sRUFBRSxZQUFZLENBQ2xCLEdBQUcsZUFBZSxTQUFTLEVBQzNCLENBQUMsR0FBRyxPQUF5QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLE9BQU87U0FDUixDQUFDLENBQ0g7UUFDRCxNQUFNLEVBQUUsWUFBWSxDQUNsQixHQUFHLGVBQWUsU0FBUyxFQUMzQixDQUFDLEdBQUcsUUFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxQixRQUFRO1NBQ1QsQ0FBQyxDQUNIO1FBQ0QsU0FBUyxFQUFFLFlBQVksQ0FDckIsR0FBRyxlQUFlLGFBQWEsRUFDL0IsQ0FBQyxTQUE2QixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FDbkQ7UUFDRCxZQUFZLEVBQUUsWUFBWSxDQUFDLEdBQUcsZUFBZSxnQkFBZ0IsQ0FBQztLQUMvRCxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENydWRBY3Rpb25zIH0gZnJvbSAnLi9jcnVkLm1vZGVsJztcbmltcG9ydCB7IGNyZWF0ZUFjdGlvbiB9IGZyb20gJ0BuZ3J4L3N0b3JlJztcbmltcG9ydCB7IFByZWRpY2F0ZSwgVXBkYXRlIH0gZnJvbSAnQG5ncngvZW50aXR5JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNydWRUcmFpdEFjdGlvbnM8RW50aXR5PihcbiAgYWN0aW9uc0dyb3VwS2V5OiBzdHJpbmcsXG4pOiBDcnVkQWN0aW9uczxFbnRpdHk+IHtcbiAgcmV0dXJuIHtcbiAgICBhZGQ6IGNyZWF0ZUFjdGlvbihgJHthY3Rpb25zR3JvdXBLZXl9IEFkZGAsICguLi5lbnRpdGllczogRW50aXR5W10pID0+ICh7XG4gICAgICBlbnRpdGllcyxcbiAgICB9KSksXG4gICAgcmVtb3ZlOiBjcmVhdGVBY3Rpb24oXG4gICAgICBgJHthY3Rpb25zR3JvdXBLZXl9IFJlbW92ZWAsXG4gICAgICAoLi4ua2V5czogc3RyaW5nW10gfCBudW1iZXJbXSkgPT4gKHtcbiAgICAgICAga2V5cyxcbiAgICAgIH0pLFxuICAgICksXG4gICAgdXBkYXRlOiBjcmVhdGVBY3Rpb24oXG4gICAgICBgJHthY3Rpb25zR3JvdXBLZXl9IFVwZGF0ZWAsXG4gICAgICAoLi4udXBkYXRlczogVXBkYXRlPEVudGl0eT5bXSkgPT4gKHtcbiAgICAgICAgdXBkYXRlcyxcbiAgICAgIH0pLFxuICAgICksXG4gICAgdXBzZXJ0OiBjcmVhdGVBY3Rpb24oXG4gICAgICBgJHthY3Rpb25zR3JvdXBLZXl9IFVwc2VydGAsXG4gICAgICAoLi4uZW50aXRpZXM6IEVudGl0eVtdKSA9PiAoe1xuICAgICAgICBlbnRpdGllcyxcbiAgICAgIH0pLFxuICAgICksXG4gICAgcmVtb3ZlQWxsOiBjcmVhdGVBY3Rpb24oXG4gICAgICBgJHthY3Rpb25zR3JvdXBLZXl9IFJlbW92ZSBBbGxgLFxuICAgICAgKHByZWRpY2F0ZT86IFByZWRpY2F0ZTxFbnRpdHk+KSA9PiAoeyBwcmVkaWNhdGUgfSksXG4gICAgKSxcbiAgICBjbGVhckNoYW5nZXM6IGNyZWF0ZUFjdGlvbihgJHthY3Rpb25zR3JvdXBLZXl9IENsZWFyIENoYW5nZXNgKSxcbiAgfTtcbn1cbiJdfQ==
