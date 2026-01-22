/**
 * DatabaseTable - Full-width table displaying analyzed companies
 * Columns: Company, Holding, Returns, Conviction Score (with donut chart), Sector, Currency, Price Thresholds, Targets, Date
 * Used in: Main database/analysis view page
 */

'use client';

import * as React from 'react';
import {
  Store,
  Blocks,
  TrendingUp,
  OctagonAlert,
  Factory,
  DollarSign,
  ArrowBigUp,
  ArrowUp,
  ArrowDown,
  ArrowBigDown,
  Target,
  Tag as TagIcon,
  Calendar,
} from 'lucide-react';
import { DatabaseHeader } from './DatabaseHeader';
import { DatabaseCell } from './DatabaseCell';
import { TagProps } from './Tag';

export interface CompanyAnalysis {
  id: string;
  companyName: string;
  isHolding: boolean;
  conservative5yTarget: number;
  priceAtAnalysis: number;
  convictionScore: number; // 0-10
  sector: string;
  currency: string;
  strongBuyThreshold: number;
  accumulateThreshold: number;
  reduceThreshold: number;
  strongSellThreshold: number;
  dateOfAnalysis: Date;
}

export interface DatabaseTableProps {
  companies: CompanyAnalysis[];
}

/**
 * Maps sector name to Tag variant
 */
function getSectorVariant(sector: string): TagProps['variant'] {
  const sectorLower = sector.toLowerCase();
  if (sectorLower.includes('tech') || sectorLower === 'technology') {
    return 'tech';
  }
  if (sectorLower.includes('finance') || sectorLower === 'financial') {
    return 'finance';
  }
  if (sectorLower.includes('cybersecurity') || sectorLower === 'cyber') {
    return 'cybersecurity';
  }
  if (sectorLower.includes('defense') || sectorLower.includes('aerospace')) {
    return 'defense';
  }
  if (sectorLower.includes('luxury')) {
    return 'luxury';
  }
  return 'default';
}

/**
 * Formats date to "Month DD, YYYY" format
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}


/**
 * DatabaseTable component - Full-width table displaying analyzed companies
 * 
 * Displays 13 columns of financial data using DatabaseHeader and DatabaseCell components.
 * Includes responsive horizontal scrolling for smaller screens.
 */
export function DatabaseTable({ companies }: DatabaseTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            <th>
              <DatabaseHeader leftIcon={Store} leftText="Company" showRightBorder={true} />
            </th>
            <th>
              <DatabaseHeader leftIcon={Blocks} leftText="Holding" />
            </th>
            <th>
              <DatabaseHeader leftIcon={TrendingUp} leftText="Conservative 5Y Return" />
            </th>
            <th>
              <DatabaseHeader leftIcon={OctagonAlert} leftText="Conviction score (/10)" />
            </th>
            <th>
              <DatabaseHeader leftIcon={Factory} leftText="Sector" />
            </th>
            <th>
              <DatabaseHeader leftIcon={DollarSign} leftText="Currency" />
            </th>
            <th>
              <DatabaseHeader leftIcon={ArrowBigUp} leftText="Strong Buy" />
            </th>
            <th>
              <DatabaseHeader leftIcon={ArrowUp} leftText="Accumulate" />
            </th>
            <th>
              <DatabaseHeader leftIcon={ArrowDown} leftText="Reduce" />
            </th>
            <th>
              <DatabaseHeader leftIcon={ArrowBigDown} leftText="Strong Sell" />
            </th>
            <th>
              <DatabaseHeader leftIcon={Target} leftText="Conservative 5Y Target" />
            </th>
            <th>
              <DatabaseHeader leftIcon={TagIcon} leftText="Price at Analysis" />
            </th>
            <th>
              <DatabaseHeader leftIcon={Calendar} leftText="Date of Analysis" />
            </th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => {
            const conservative5yReturn = company.priceAtAnalysis > 0
              ? ((company.conservative5yTarget / company.priceAtAnalysis) * 100).toFixed(1)
              : '0.0';

            return (
              <tr
                key={company.id}
                className="even:bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors border-b border-neutral-200 last:border-b-0"
              >
                <td>
                  <DatabaseCell variant="text" content={company.companyName} />
                </td>
                <td>
                  <DatabaseCell
                    variant="select"
                    tags={[
                      {
                        label: company.isHolding ? 'Yes' : 'No',
                        variant: 'default',
                      },
                    ]}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="number"
                    content={`${conservative5yReturn}%`}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="number"
                    content={company.convictionScore.toString()}
                    showDonutChart={true}
                    donutValue={company.convictionScore}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="select"
                    tags={[
                      {
                        label: company.sector,
                        variant: getSectorVariant(company.sector),
                      },
                    ]}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="select"
                    tags={[
                      {
                        label: company.currency,
                        variant: 'default',
                      },
                    ]}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="number"
                    content={`$${company.strongBuyThreshold}`}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="number"
                    content={`$${company.accumulateThreshold}`}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="number"
                    content={`$${company.reduceThreshold}`}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="number"
                    content={`$${company.strongSellThreshold}`}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="number"
                    content={`$${company.conservative5yTarget}`}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="number"
                    content={`$${company.priceAtAnalysis}`}
                  />
                </td>
                <td>
                  <DatabaseCell
                    variant="text"
                    content={formatDate(company.dateOfAnalysis)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
