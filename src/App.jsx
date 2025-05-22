/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const getPreparedProducts = (
  products,
  users,
  categories,
  userFilter,
  query,
  categoriesFilter,
) => {
  let preparedProducts = products.map(prod => {
    const category =
      categories.find(categ => categ.id === prod.categoryId) || null;
    const user = users.find(us => us.id === category.ownerId) || null;

    return {
      ...prod,
      category,
      user,
    };
  });

  if (userFilter.id) {
    preparedProducts = preparedProducts.filter(
      product => product.user.id === userFilter.id,
    );
  }

  if (query) {
    const normalizedQuery = query.toLowerCase().trim();

    preparedProducts = preparedProducts.filter(product => {
      return product.name.toLowerCase().includes(normalizedQuery);
    });
  }

  if (categoriesFilter.length !== 0) {
    preparedProducts = preparedProducts.filter(product => {
      return categoriesFilter.includes(product.category.title);
    });
  }

  return preparedProducts;
};

const COLUMNS_TITLES = ['ID', 'Product', 'Category', 'User'];

export const App = () => {
  const [userFilter, setUserFilter] = useState({});
  const [query, setQuery] = useState('');
  const [categoriesFilter, setCategoriesFilter] = useState([]);

  const products = getPreparedProducts(
    productsFromServer,
    usersFromServer,
    categoriesFromServer,
    userFilter,
    query,
    categoriesFilter,
  );

  const reset = () => {
    setQuery('');
    setUserFilter({});
    setCategoriesFilter([]);
  };

  const addCategory = value => {
    setCategoriesFilter(prev => [...prev, value]);
  };

  const removeCategory = value => {
    setCategoriesFilter(prev => prev.filter(categ => categ !== value));
  };

  const isProductsEmpty = products.length === 0;
  const isQueryEmpty = query.length === 0;
  const isCategoriesFilterEmpty = categoriesFilter.length === 0;
  const isAnyFilters = userFilter.id || query || !isCategoriesFilterEmpty;

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': !userFilter.id })}
                onClick={() => setUserFilter({})}
              >
                All
              </a>

              {usersFromServer.map(user => {
                const userIsActive = userFilter.id === user.id;

                return (
                  <a
                    data-cy="FilterUser"
                    href="#/"
                    className={cn({ 'is-active': userIsActive })}
                    key={user.id}
                    onClick={() => setUserFilter(user)}
                  >
                    {user.name}
                  </a>
                );
              })}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="!WARNING! entering value may cause re-render xD"
                  value={query}
                  onChange={event => setQuery(event.target.value.trimStart())}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {!isQueryEmpty && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6 ', {
                  'is-outlined': !isCategoriesFilterEmpty,
                })}
                onClick={() => setCategoriesFilter([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => {
                const isCategoryActive = categoriesFilter.includes(
                  category.title,
                );

                return (
                  <a
                    data-cy="Category"
                    className={cn('button mr-2 my-1 ', {
                      'is-info': isCategoryActive,
                    })}
                    href="#/"
                    onClick={
                      isCategoryActive
                        ? () => removeCategory(category.title)
                        : () => addCategory(category.title)
                    }
                  >
                    {category.title}
                  </a>
                );
              })}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className={cn('button is-link is-fullwidth', {
                  'is-outlined': !isAnyFilters,
                })}
                onClick={reset}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {isProductsEmpty ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {COLUMNS_TITLES.map(title => {
                    return (
                      <th key={title}>
                        <span className="is-flex is-flex-wrap-nowrap">
                          {title}
                          <a href="#/">
                            <span className="icon">
                              <i data-cy="SortIcon" className="fas fa-sort" />
                            </span>
                          </a>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {products.map(prod => {
                  const { name, id, category, user } = prod;
                  const isMale = user.sex === 'm';

                  return (
                    <tr data-cy="Product" key={id}>
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {id}
                      </td>

                      <td data-cy="ProductName">{name}</td>
                      <td data-cy="ProductCategory">{`${category.icon} - ${category.title}`}</td>

                      <td
                        data-cy="ProductUser"
                        className={cn({
                          'has-text-link': isMale,
                          'has-text-danger': !isMale,
                        })}
                      >
                        {user.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
