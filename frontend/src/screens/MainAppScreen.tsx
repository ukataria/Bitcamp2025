const serverUrl = "http://10.20.59.57:5001/";

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Get device dimensions to create responsive layouts
const { width } = Dimensions.get('window');
const isLargeDevice = width >= 400; // Check if it's a larger device like iPhone 15 Pro Max

type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  merchant?: string;
  location?: string;
  postDate?: string;
};

type Category = {
  name: string;
  budget: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  insights?: string[];
};

type InsightType = {
  title: string;
  description: string;
  type: 'warning' | 'tip' | 'achievement';
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

// Mock data for transactions (fallback if no imported transactions)
const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Monthly Groceries',
    amount: 245.50,
    category: 'Food',
    date: '2024-04-12',
    type: 'expense',
    merchant: 'Whole Foods',
    location: 'San Francisco, CA'
  },
  {
    id: '2',
    description: 'Netflix Subscription',
    amount: 15.99,
    category: 'Entertainment',
    date: '2024-04-11',
    type: 'expense',
    merchant: 'Netflix'
  },
  {
    id: '3',
    description: 'Salary Deposit',
    amount: 3500.00,
    category: 'Income',
    date: '2024-04-01',
    type: 'income',
    merchant: 'Tech Corp Inc'
  },
  {
    id: '4',
    description: 'Uber Eats Dinner',
    amount: 25.99,
    category: 'Food',
    date: '2024-04-10',
    type: 'expense',
    merchant: 'Uber Eats',
    location: 'San Francisco, CA'
  },
  {
    id: '5',
    description: 'Grocery Shopping',
    amount: 85.47,
    category: 'Food',
    date: '2024-04-08',
    type: 'expense',
    merchant: 'Whole Foods',
    location: 'San Francisco, CA'
  },
  {
    id: '6',
    description: 'Monthly Salary',
    amount: 4250.00,
    category: 'Income',
    date: '2024-04-01',
    type: 'income',
    merchant: 'Tech Corp Inc'
  },
  {
    id: '7',
    description: 'Apartment Rent',
    amount: 1800.00,
    category: 'Housing',
    date: '2024-04-01',
    type: 'expense',
  },
  {
    id: '8',
    description: 'Uber Ride',
    amount: 18.50,
    category: 'Transport',
    date: '2024-04-09',
    type: 'expense',
    merchant: 'Uber',
    location: 'San Francisco, CA'
  },
  {
    id: '9',
    description: 'Starbucks Coffee',
    amount: 5.75,
    category: 'Food',
    date: '2024-04-11',
    type: 'expense',
    merchant: 'Starbucks',
    location: 'San Francisco, CA'
  },
  {
    id: '10',
    description: 'Amazon Purchase',
    amount: 67.99,
    category: 'Shopping',
    date: '2024-04-07',
    type: 'expense',
    merchant: 'Amazon',
  },
];

export default function MainAppScreen({ route }: { route?: any }) {
  // Get analysis data from route params if available
  const analysisData = route?.params?.analysis || {};
  const importedTransactions = analysisData?.top_transactions || [];

  // Transform imported transactions to match our Transaction type
  const transformedImportedTransactions = importedTransactions.map((item: any, index: number) => ({
    id: `imported-${index}`,
    description: item.description || "Unknown Transaction",
    amount: Math.abs(parseFloat(item.amount) || 0), // Use absolute value for display, negative values are expenses
    category: item.category || 'Uncategorized',
    date: item.transactionDate || new Date().toISOString().split('T')[0],
    type: parseFloat(item.amount) < 0 || item.type === 'Sale' ? 'expense' : 'income',
    merchant: item.description,
    postDate: item.postDate
  }));

  // Initialize transactions with imported data if available, otherwise use mock data
  const [transactions, setTransactions] = useState<Transaction[]>(
    transformedImportedTransactions.length > 0 ? transformedImportedTransactions : mockTransactions
  );

  const categoryMapping = (category: any): Category => {
    const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      meals: 'food',
      groceries: 'cart-outline',
      travel: 'airplane',
      entertainment: 'movie'
    };

    const budgetMap: Record<string, number> = {
      meals: 100,
      groceries: 200,
      travel: 150,
      entertainment: 50
    };

    const nameMap: Record<string, string> = {
      meals: 'Food & Drink',
      groceries: 'Groceries',
      travel: 'Travel',
      entertainment: 'Entertainment'
    };

    const icon: keyof typeof MaterialCommunityIcons.glyphMap = iconMap[category.type?.toLowerCase()] ?? 'food';
    const budget: number = budgetMap[category.type?.toLowerCase()] ?? 0;
    const name: string = nameMap[category.type?.toLowerCase()] ?? 'None';

    return {
      name: name,
      budget: budget,
      icon: icon,
      insights: category.points
    };
  }

  const categories: Category[] = analysisData.actions.categorical.map((category: any) => categoryMapping(category))
  const [newTransaction, setNewTransaction] = useState<{
    description: string;
    amount: string;
    category: string;
    type: Transaction['type'];
  }>({
    description: '',
    amount: '',
    category: 'Food',
    type: 'expense',
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('Food');

  // Use insets to get safe area values
  const insets = useSafeAreaInsets();

  const formatDate = (dateString: string) => {
    try {
      let date;
      if (dateString.includes('/')) {
        const [month, day, year] = dateString.split('/');
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return dateString;
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const analysisMapping = (item: any): InsightType => {
    const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      warning: 'alert-circle',
      achievement: 'trophy',
      tip: 'lightbulb',
    };

    const icon: keyof typeof MaterialCommunityIcons.glyphMap = iconMap[item.type?.toLowerCase()] ?? 'info';

    return {
      title: item.title,
      description: item.description,
      type: item.type,
      icon: icon,
    };
  }

  // Generate Insights from Analysis
  const insights: InsightType[] = analysisData.actions.general.map((item: any) => analysisMapping(item));

  const addTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      date: new Date().toISOString().split('T')[0],
      type: newTransaction.type,
    };
    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      description: '',
      amount: '',
      category: 'Food',
      type: 'expense',
    });

    const formData = new FormData();
    formData.append('description', newTransaction.description);
    formData.append('category', "food");
    formData.append('amount', newTransaction.amount);

    var transactionAnalysis: any = null;

    await fetch(serverUrl + 'new_transaction', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => { console.log(data); transactionAnalysis = data; })
      .catch(error => console.error('Error:', error));
    if (transactionAnalysis.necessarySpend < 0.4) {
      Alert.alert(
        "Potential Saving Opportunity",
        transactionAnalysis.reason,
        [{ text: "OK" }]
      );
    }
    else {
      console.log("Transaction Passed")
      console.log(transactionAnalysis.necessarySpend)
    }

  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const renderInsightCard = (insight: InsightType) => (
    <View style={[styles.insightCard, styles[`${insight.type}Card`]]}>
      <MaterialCommunityIcons
        name={insight.icon}
        size={24}
        color={insight.type === 'warning' ? '#DC2626' :
          insight.type === 'tip' ? '#2563EB' : '#059669'}
      />
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <Text style={styles.insightDescription}>{insight.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={[
        styles.header,
        { marginTop: insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 50 : StatusBar.currentHeight }
      ]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="wallet" size={24} color="#4F46E5" />
          <Text style={styles.headerText}>Smart Finance</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cards}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Balance</Text>
              <MaterialCommunityIcons name="chart-pie" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.cardAmount}>${balance.toFixed(2)}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Income</Text>
              <MaterialCommunityIcons name="arrow-up" size={20} color="#22C55E" />
            </View>
            <Text style={[styles.cardAmount, styles.incomeText]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Expenses</Text>
              <MaterialCommunityIcons name="arrow-down" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.cardAmount, styles.expenseText]}>
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <View style={styles.insightsList}>
              {insights.map((insight, index) => (
                <View key={index}>
                  {renderInsightCard(insight)}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.transactionsList}>
              {transactions.slice(0, 10).map(transaction => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionMeta}>
                      {transaction.category} • {formatDate(transaction.date)}
                      {transaction.merchant && transaction.merchant !== transaction.description && ` • ${transaction.merchant}`}
                      {transaction.postDate && ` • Posted: ${formatDate(transaction.postDate)}`}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text
                      style={[
                        styles.amount,
                        transaction.type === 'income'
                          ? styles.incomeText
                          : styles.expenseText,
                      ]}
                    >
                      {transaction.type === 'income' ? '+' : '-'}$
                      {transaction.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteTransaction(transaction.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons
                        name="trash-can"
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {transactions.length === 0 && (
                <Text style={styles.emptyText}>No transactions yet</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Insights</Text>
            <View style={styles.categoriesList}>
              {categories.map(category => {
                const spent = transactions
                  .filter(t => t.category === category.name && t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0);
                const percentage = (spent / category.budget) * 100;

                return (
                  <TouchableOpacity
                    key={category.name}
                    style={styles.categoryItem}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryInfo}>
                        <MaterialCommunityIcons
                          name={category.icon}
                          size={20}
                          color="#4F46E5"
                        />
                        <Text style={styles.categoryName}>{category.name}</Text>
                      </View>
                      <Text style={styles.categoryAmount}>
                        ${spent.toFixed(2)} / ${category.budget}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor:
                              percentage > 100
                                ? '#DC2626'
                                : percentage > 75
                                  ? '#D97706'
                                  : '#059669',
                          },
                        ]}
                      />
                    </View>
                    {selectedCategory === category.name && category.insights && (
                      <View style={styles.categoryInsights}>
                        {category.insights.map((insight, index) => (
                          <Text key={index} style={styles.categoryInsight}>
                            • {insight}
                          </Text>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Transaction</Text>
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={newTransaction.description}
                  onChangeText={text =>
                    setNewTransaction({
                      ...newTransaction,
                      description: text,
                    })
                  }
                  placeholder="Enter description"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={newTransaction.amount}
                  onChangeText={text =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: text,
                    })
                  }
                  placeholder="Enter amount"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newTransaction.category}
                    onValueChange={(value: string) =>
                      setNewTransaction({
                        ...newTransaction,
                        category: value,
                      })
                    }
                    style={styles.picker}
                  >
                    {categories.map(category => (
                      <Picker.Item
                        key={category.name}
                        label={category.name}
                        value={category.name}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newTransaction.type === 'expense' && styles.activeTypeButton,
                    ]}
                    onPress={() =>
                      setNewTransaction({
                        ...newTransaction,
                        type: 'expense',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newTransaction.type === 'expense' &&
                        styles.activeTypeButtonText,
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newTransaction.type === 'income' && styles.activeTypeButton,
                    ]}
                    onPress={() =>
                      setNewTransaction({
                        ...newTransaction,
                        type: 'income',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newTransaction.type === 'income' &&
                        styles.activeTypeButtonText,
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={addTransaction}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 80, // Increased bottom padding for better scrolling experience
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: isLargeDevice ? 24 : 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // marginTop is now set dynamically in the component
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: isLargeDevice ? 24 : 22,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#111827',
  },
  cards: {
    padding: isLargeDevice ? 24 : 16,
    marginTop: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: isLargeDevice ? 20 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: isLargeDevice ? 20 : 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: isLargeDevice ? 18 : 16,
    color: '#6B7280',
  },
  cardAmount: {
    fontSize: isLargeDevice ? 32 : 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  incomeText: {
    color: '#22C55E',
  },
  expenseText: {
    color: '#EF4444',
  },
  content: {
    paddingHorizontal: isLargeDevice ? 24 : 16,
    paddingTop: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: isLargeDevice ? 24 : 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: isLargeDevice ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
  },
  tipCard: {
    backgroundColor: '#EFF6FF',
  },
  achievementCard: {
    backgroundColor: '#F0FDF4',
  },
  insightContent: {
    marginLeft: 12,
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryAmount: {
    fontSize: 16,
    color: '#6B7280',
  },
  categoryInsights: {
    marginTop: 12,
    gap: 8,
  },
  categoryInsight: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 12,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#4F46E5',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTypeButtonText: {
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
})
