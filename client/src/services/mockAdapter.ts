import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { db } from './mockDb.js';

const matchRoute = (method: string, pattern: string, requestMethod: string, requestPath: string) => {
  if (method.toUpperCase() !== requestMethod.toUpperCase()) return null;
  const patternParts = pattern.split('/');
  const pathParts = requestPath.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
};

export default function mockAdapter(config: any): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    try {
      // 1. Parse URL & path
      let path = config.url || '';
      if (path.startsWith('http://') || path.startsWith('https://')) {
        path = new URL(path).pathname;
      }
      // Remove /api prefix if present
      path = path.replace(/^\/api/, '');
      if (!path.startsWith('/')) {
        path = '/' + path;
      }

      const method = config.method || 'get';
      
      // Parse body
      let body: any = {};
      if (config.data) {
        if (config.data instanceof FormData) {
          config.data.forEach((value: any, key: string) => {
            body[key] = value;
          });
        } else if (typeof config.data === 'string') {
          try {
            body = JSON.parse(config.data);
          } catch {
            body = {};
          }
        } else {
          body = config.data;
        }
      }

      // Query params
      const params = config.params || {};

      let resultData: any = null;
      let matchedParams: Record<string, string> | null = null;

      // 2. Route Matching
      
      // GET /auth/me
      if (matchRoute('get', '/auth/me', method, path)) {
        resultData = { status: 'success', data: db.getCurrentUser() };
      }
      // PUT /auth/profile
      else if (matchRoute('put', '/auth/profile', method, path)) {
        resultData = { status: 'success', data: db.updateCurrentUser(body) };
      }
      // POST /auth/login
      else if (matchRoute('post', '/auth/login', method, path)) {
        resultData = { status: 'success', data: db.login(body.email) };
      }
      // POST /auth/register
      else if (matchRoute('post', '/auth/register', method, path)) {
        // Register demo user automatically
        const user = db.getCurrentUser();
        resultData = { status: 'success', data: { token: 'mock-jwt-token', user } };
      }
      
      // GET /accounts
      else if (matchRoute('get', '/accounts', method, path)) {
        resultData = { status: 'success', data: db.getAccounts() };
      }
      // POST /accounts
      else if (matchRoute('post', '/accounts', method, path)) {
        resultData = { status: 'success', data: db.createAccount(body) };
      }
      // PUT /accounts/:id
      else if ((matchedParams = matchRoute('put', '/accounts/:id', method, path))) {
        resultData = { status: 'success', data: db.updateAccount(matchedParams.id, body) };
      }
      // DELETE /accounts/:id
      else if ((matchedParams = matchRoute('delete', '/accounts/:id', method, path))) {
        resultData = { status: 'success', data: db.deleteAccount(matchedParams.id) };
      }
      
      // GET /categories
      else if (matchRoute('get', '/categories', method, path)) {
        resultData = { status: 'success', data: db.getCategories() };
      }
      // POST /categories
      else if (matchRoute('post', '/categories', method, path)) {
        resultData = { status: 'success', data: db.createCategory(body) };
      }
      // PUT /categories/:id
      else if ((matchedParams = matchRoute('put', '/categories/:id', method, path))) {
        resultData = { status: 'success', data: db.updateCategory(matchedParams.id, body) };
      }
      // DELETE /categories/:id
      else if ((matchedParams = matchRoute('delete', '/categories/:id', method, path))) {
        resultData = { status: 'success', data: db.deleteCategory(matchedParams.id) };
      }
      
      // GET /transactions
      else if (matchRoute('get', '/transactions', method, path)) {
        resultData = { status: 'success', data: db.getTransactions(params) };
      }
      // POST /transactions
      else if (matchRoute('post', '/transactions', method, path)) {
        resultData = { status: 'success', data: db.createTransaction(body) };
      }
      // DELETE /transactions/:id
      else if ((matchedParams = matchRoute('delete', '/transactions/:id', method, path))) {
        resultData = { status: 'success', data: db.deleteTransaction(matchedParams.id) };
      }
      
      // GET /budgets
      else if (matchRoute('get', '/budgets', method, path)) {
        const now = new Date();
        const month = params.month ? parseInt(params.month, 10) : (now.getMonth() + 1);
        const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
        resultData = { status: 'success', data: db.getBudgets(month, year) };
      }
      // POST /budgets
      else if (matchRoute('post', '/budgets', method, path)) {
        resultData = { status: 'success', data: db.createBudget(body) };
      }
      // DELETE /budgets/:id
      else if ((matchedParams = matchRoute('delete', '/budgets/:id', method, path))) {
        resultData = { status: 'success', data: db.deleteBudget(matchedParams.id) };
      }
      
      // GET /bills
      else if (matchRoute('get', '/bills', method, path)) {
        resultData = { status: 'success', data: db.getBills() };
      }
      // POST /bills
      else if (matchRoute('post', '/bills', method, path)) {
        resultData = { status: 'success', data: db.createBill(body) };
      }
      // PATCH /bills/:id/paid
      else if ((matchedParams = matchRoute('patch', '/bills/:id/paid', method, path))) {
        resultData = { status: 'success', data: db.toggleBillPaid(matchedParams.id) };
      }
      // DELETE /bills/:id
      else if ((matchedParams = matchRoute('delete', '/bills/:id', method, path))) {
        resultData = { status: 'success', data: db.deleteBill(matchedParams.id) };
      }
      
      // GET /goals
      else if (matchRoute('get', '/goals', method, path)) {
        resultData = { status: 'success', data: db.getGoals() };
      }
      // POST /goals
      else if (matchRoute('post', '/goals', method, path)) {
        resultData = { status: 'success', data: db.createGoal(body) };
      }
      // POST /goals/:id/contribute
      else if ((matchedParams = matchRoute('post', '/goals/:id/contribute', method, path))) {
        const amt = parseFloat(body.amount);
        resultData = { status: 'success', data: db.contributeGoal(matchedParams.id, amt) };
      }
      // DELETE /goals/:id
      else if ((matchedParams = matchRoute('delete', '/goals/:id', method, path))) {
        resultData = { status: 'success', data: db.deleteGoal(matchedParams.id) };
      }
      
      // GET /notifications
      else if (matchRoute('get', '/notifications', method, path)) {
        resultData = { status: 'success', data: db.getNotifications() };
      }
      
      // GET /reports/dashboard
      else if (matchRoute('get', '/reports/dashboard', method, path)) {
        resultData = { status: 'success', data: db.getDashboardSummary() };
      }
      // GET /reports/category-spending
      else if (matchRoute('get', '/reports/category-spending', method, path)) {
        resultData = { status: 'success', data: db.getCategorySpendingReport(params) };
      }
      // GET /reports/monthly-trends
      else if (matchRoute('get', '/reports/monthly-trends', method, path)) {
        const months = params.months ? parseInt(params.months, 10) : 6;
        resultData = { status: 'success', data: db.getMonthlyTrendsReport(months) };
      }
      
      // GET /export/csv
      else if (matchRoute('get', '/export/csv', method, path)) {
        const csvContent = db.exportCSV();
        if (config.responseType === 'blob') {
          resultData = new Blob([csvContent], { type: 'text/csv' });
        } else {
          resultData = csvContent;
        }
      }
      // GET /export/backup
      else if (matchRoute('get', '/export/backup', method, path)) {
        const backupContent = JSON.stringify(db.exportBackup(), null, 2);
        if (config.responseType === 'blob') {
          resultData = new Blob([backupContent], { type: 'application/json' });
        } else {
          resultData = JSON.parse(backupContent);
        }
      }

      // If no route matched
      if (resultData === null) {
        console.warn(`Mock API: Unhandled endpoint ${method.toUpperCase()} ${path}`);
        return reject({
          config,
          response: {
            status: 404,
            statusText: 'Not Found',
            data: { error: `Endpoint ${path} not mocked` },
            headers: {},
            config,
          },
        });
      }

      // 3. Return Axios Response
      const response: AxiosResponse = {
        data: resultData,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': config.responseType === 'blob' ? (path.includes('csv') ? 'text/csv' : 'application/json') : 'application/json',
        },
        config,
      };

      // Simulate a small network latency (100ms) for high fidelity
      setTimeout(() => resolve(response), 100);
      
    } catch (err: any) {
      reject({
        config,
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: { error: err.message || 'Mock Server Error' },
          headers: {},
          config,
        },
      });
    }
  });
}
