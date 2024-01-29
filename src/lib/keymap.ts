type Split<T extends string> = T extends `${infer F}${infer R}` ? [F, ...Split<R>] : []

type IndexOf<
    T, K extends unknown[],
    H extends unknown[] = []
> = K[H['length']] extends T ? H['length'] : IndexOf<T, K, [unknown, ...H]>

export const createKeyMap = (<
    T extends string[],
    K extends Record<string, T[number]>
>(keyList: T, secondaryKeyMap?: K) => {
    const keyMap = Object.fromEntries(keyList.map(
        (item, index) => [item, index]
    )) as { [Key in T[number]]: IndexOf<Key, T> }
    const nextKeyMap = secondaryKeyMap ? Object.fromEntries(Object.keys(secondaryKeyMap).map(
        key => [key, keyMap[secondaryKeyMap[key]]]
    )) as unknown as { [Key in keyof K]: IndexOf<K[Key], T> } : {}
    return Object.assign(keyMap, nextKeyMap)
})

export const strToArray = <T extends string>(str: T) => str.split('') as Split<T>
