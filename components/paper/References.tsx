/**
 * References. Strings are reconciled against the citation-verification pass
 * before deploy; anything unconfirmed is flagged inline with [unconfirmed]
 * rather than asserted.
 */
export function References() {
  return (
    <>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>
          S. A. Seshia, D. Sadigh, and S. S. Sastry, &ldquo;Toward Verified Artificial
          Intelligence,&rdquo; <em>Communications of the ACM</em>, vol. 65, no. 7, pp. 46–55, 2022,
          doi:10.1145/3503914 (preprint arXiv:1606.08514).
        </li>
        <li>
          R. Greenblatt, B. Shlegeris, K. Sachan, and F. Roger, &ldquo;AI Control: Improving Safety
          Despite Intentional Subversion,&rdquo; in <em>Proc. 41st Int. Conf. Machine Learning
          (ICML)</em>, 2024 (arXiv:2312.06942).
        </li>
        <li>
          T. Gu, B. Dolan-Gavitt, and S. Garg, &ldquo;BadNets: Identifying Vulnerabilities in the
          Machine Learning Model Supply Chain,&rdquo; arXiv:1708.06733, 2017.
        </li>
        <li>
          S. R. Bowman <em>et al.</em>, &ldquo;Measuring Progress on Scalable Oversight for Large
          Language Models,&rdquo; arXiv:2211.03540, 2022.
        </li>
      </ol>
      <p className="mt-3 text-sm text-neutral-400">
        <em>Artifact:</em> the <code>correct-shaped-lies</code> repository — evaluator stack and{" "}
        <code>all_passed()</code> gate, the graded T0/T1/T2 adversary, the read-only composition layer,
        and byte-identical reproduction of the result CSVs and Fig. 1.
      </p>
    </>
  );
}
