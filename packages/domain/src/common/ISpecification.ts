export interface ISpecification<T> {
  isSatisfiedBy(entity: T): boolean;
}
