import {
  getContributionMonthLabels,
  getGitHubContributions,
} from "@/lib/github-contributions";
import { getGitHubUsername } from "@/lib/env";
import { site } from "@/lib/site";
import type { CSSProperties } from "react";

function formatCount(n: number) {
  return n.toLocaleString("en");
}

export async function GitHubContributions() {
  const username = getGitHubUsername();
  const calendar = await getGitHubContributions(username);
  if (!calendar) return null;

  const monthLabels = getContributionMonthLabels(calendar.weeks);

  return (
    <section
      className="gh-contrib"
      style={{ "--gh-weeks": calendar.weeks.length } as CSSProperties}
      aria-label="github contributions"
    >
      <div className="gh-contrib-head">
        <a
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
          className="gh-contrib-user"
        >
          @{username}
        </a>
        <span className="gh-contrib-total">
          {formatCount(calendar.total)} contributions
        </span>
      </div>

      <div className="gh-contrib-scroll">
        <div className="gh-contrib-months">
          {monthLabels.map((label, i) => (
            <span key={i} className="gh-contrib-month">
              {label}
            </span>
          ))}
        </div>

        <div className="gh-contrib-grid">
          {calendar.weeks.map((week) =>
            week.map((day) => (
              <div
                key={day.date}
                className="gh-cell"
                data-level={day.level}
                title={`${formatCount(day.count)} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="gh-contrib-legend" aria-hidden>
        <span className="gh-contrib-legend-label">less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className="gh-cell" data-level={level} />
        ))}
        <span className="gh-contrib-legend-label">more</span>
      </div>
    </section>
  );
}
