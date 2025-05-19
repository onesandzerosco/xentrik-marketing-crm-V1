
import { useMemo } from 'react';
import { IncomeEntry } from './types';
import { InvoiceSettings, InvoiceSummary } from './InvoiceTypes';

export const useInvoiceCalculations = (data: IncomeEntry[], settings: InvoiceSettings) => {
  const invoiceSummary = useMemo<InvoiceSummary>(() => {
    if (!data.length) {
      return {
        totalIncome: 0,
        xentrikAmount: 0,
        creatorAmount: 0,
        breakdown: []
      };
    }

    // Calculate totals for each income source
    const totals = {
      subscriptions: 0,
      tips: 0,
      posts: 0,
      messages: 0,
      referrals: 0,
      streams: 0,
      total: 0
    };
    
    data.forEach(entry => {
      totals.subscriptions += entry.subscriptions;
      totals.tips += entry.tips;
      totals.posts += entry.posts;
      totals.messages += entry.messages;
      totals.referrals += entry.referrals;
      totals.streams += entry.streams;
      totals.total += entry.total;
    });

    // Calculate amounts for Xentrik and the creator
    const xentrikAmount = totals.total * (settings.xentrikPercentage / 100);
    const creatorAmount = totals.total - xentrikAmount;

    // Create breakdown for each source
    const breakdown = [
      {
        source: 'Subscriptions',
        amount: totals.subscriptions,
        xentrikAmount: totals.subscriptions * (settings.xentrikPercentage / 100),
        creatorAmount: totals.subscriptions * (1 - settings.xentrikPercentage / 100)
      },
      {
        source: 'Tips',
        amount: totals.tips,
        xentrikAmount: totals.tips * (settings.xentrikPercentage / 100),
        creatorAmount: totals.tips * (1 - settings.xentrikPercentage / 100)
      },
      {
        source: 'Posts',
        amount: totals.posts,
        xentrikAmount: totals.posts * (settings.xentrikPercentage / 100),
        creatorAmount: totals.posts * (1 - settings.xentrikPercentage / 100)
      },
      {
        source: 'Messages',
        amount: totals.messages,
        xentrikAmount: totals.messages * (settings.xentrikPercentage / 100),
        creatorAmount: totals.messages * (1 - settings.xentrikPercentage / 100)
      },
      {
        source: 'Referrals',
        amount: totals.referrals,
        xentrikAmount: totals.referrals * (settings.xentrikPercentage / 100),
        creatorAmount: totals.referrals * (1 - settings.xentrikPercentage / 100)
      },
      {
        source: 'Streams',
        amount: totals.streams,
        xentrikAmount: totals.streams * (settings.xentrikPercentage / 100),
        creatorAmount: totals.streams * (1 - settings.xentrikPercentage / 100)
      }
    ];

    return {
      totalIncome: totals.total,
      xentrikAmount,
      creatorAmount,
      breakdown
    };
  }, [data, settings.xentrikPercentage]);

  return invoiceSummary;
};
