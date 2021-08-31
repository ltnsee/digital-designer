const kinkSort = [
  "介绍",
  "通用",
  "布局",
  "导航",
  "数据录入",
  "数据展示",
  "反馈",
  "其他",
];

export const parameters = {
  options: {
    storySort: (a, b) => {
      if (a[1].kind === b[1].kind) {
        return 0;
      } else {
        let aSortIndex = 0,
          bSortIndex = 0;
        for (let i = 0; i < kinkSort.length; i++) {
          if (a[1].kind.includes(kinkSort[i])) {
            aSortIndex = i;
          } else if (b[1].kind.includes(kinkSort[i])) {
            bSortIndex = i;
          }
        }
        return aSortIndex - bSortIndex;
      }
    },
  },
};
