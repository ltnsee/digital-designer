import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/workflow',
  },
  {
    path: '/workflow',
    name: 'Workflow',
    component: () => import(/* webpackChunkName: "workflow" */ '../views/workflow'),
  },
  {
    path: '/select-user',
    name: 'SelectUser',
    component: () => import(/* webpackChunkName: "select-user" */ '../views/select-user'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
