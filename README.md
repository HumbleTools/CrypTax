# CrypTax

Cette application calcule les plus-values sur les cessions réalisées lors des équilibrages sur les indexes Bitpanda. Elle tente de respecter [l'article 150 VH bis du code des impôts français](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038612228/).

## Mise en garde

Ces calculs et considérations sont le fruit de ma propre réflexion et peuvent comporter des erreurs. Je ne suis ni juriste, ni conseiller financier. Tout usage de ce code engage votre seule responsabilité, tout comme les montants que vous déclarerez en votre nom à l'administration fiscale. Veuillez vous rapprocher d'un professionnel pour toute vérification de confirmité des calculs et montants exigés par votre situation fiscale.

## Explications & considérations

Pour le moment, les calculs se concentrent sur les cessions réalisées lors des équilibrages sur les indexes Bitpanda. Cela implique les particularités de calcul énumérées ci-après.

1. L'investissement dans un index Bitpanda est considéré comme un portefeuille de crypto-actifs. Chaque transaction d'ajustement est donc considérée comme une transaction qui aurait été faite directement par l'investisseur.

2. Bitpanda applique directement les frais dans les tarifs appliqués lors des achats et ventes d'actifs. Les prix de vente sont donc plus bas que le marché, ce qui génère un prix de cession plus bas (prix réel moins les frais).Ils n'ont donc pas à être déduits des prix des cessions vu que c'est déjà fait. Les prix d'achat sont plus hauts que le marché pour inclure les frais, ce qui génère un prix d'acquisition plus haut. Ainsi le prix d'acquisition comprend déjà les frais. Cela implique qu'aucun frais n'apparaît dans les calculs. Il n'y a pas non plus de soultes.

3. Etant donné que Bitpanda réalise toujours les ajustements en passant par l'euro, c'est à dire qu'il n'y a aucune transaction de crypto-actif à crypto-actif, cela permet une simplification. Dit encore autrement, aucune plus-value ne peut découler du passage d'un actif non fiat à un autre, car toutes les transactions impliquent l'euro. 
Cela permet de considérer chaque actif comme cloisonné dans son propre portefeuille. Ainsi, lors du calcul de la valeur globale de chaque  portefeuille d'actif, seul le prix actuel de l'actif considéré compte. Ce prix étant déjà indiqué dans les différentes transactions ce cession de l'actif, nul besoin d'aller récupérer en ligne le prix actuel de chaque actif du portefeuille global.
In-fine, les plus-values sont calculées séparément par actif, et sommées tout actifs confondus uniquement à la fin des calculs de l'année considérée.

4. Les dons promotionnels de BEST sont considérés comme des acquisitions à titre gratuit. Les prix d'acquisition considérés sont donc le produit de la quantité de BEST et du prix du BEST en euro au moment du don.

5. Les calculs considèrent les quantités de crypto-actifs avec une précision de 8 chiffres après la virgule. Les valeurs en fiat sont calculées avec une précision au centime près, c'est à dire avec deux chiffres après la virgule. Ces contraintes proviennent des précisions constatées à la lecture des transactions fournies par Bitpanda. Ce déphasage de précision est requis à cause des grandes différences d'ordres de grandeur entre les nombres impliqués. Les arrondis nécessaires sont réalisés grâce à la logique de correction décrite dans [cet article](https://medium.com/@tbreijm/exact-calculations-in-typescript-node-js-b7333803609e
) afin de réduire au maximum les erreurs possibles liées aux arrondis de [nombres à virgules flottantes](https://fr.wikipedia.org/wiki/Virgule_flottante).

6. Pour le calcul des prix d'acquisition lors des cessions, ce sont les actifs achetés en premier qui sont vendus en premier ([méthode PEPS](https://fr.wikipedia.org/wiki/Premier_entr%C3%A9,_premier_sorti_(gestion))).


## Installation

TODO

## Utilisation

TODO
