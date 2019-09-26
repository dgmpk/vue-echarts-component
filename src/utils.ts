/**
 * @param {number} millisecond
 * @return {Promise} 延时一定时间resolve的Promise
 */
export function sleep(millisecond: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, millisecond))
}

/**
 * @param {number} len 要创建数组的长度
 * @param {(function(index): *} fn
 * @return {array}
 */
export function createArray<T>(len: number, fn: (index: number) => T): T[] {
  const factory = typeof fn === 'function' ? fn : () => fn
  const arr = new Array(len)
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < len; i++) {
    arr[i] = factory(i)
  }
  return arr
}

/**
 * 返回给定年月有多少天
 * @param {number} month 传1~12
 * @return {number}
 */
export function getNumberOfDaysInTheMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}
