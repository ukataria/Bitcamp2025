import React, { useState } from 'react';
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

// Mock data for demo purposes
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
    date: '2025-04-10',
    type: 'expense',
    merchant: 'Uber Eats',
    location: 'San Francisco, CA'
  },
  {
    id: '5',
    description: 'Grocery Shopping',
    amount: 85.47,
    category: 'Food',
    date: '2025-04-08',
    type: 'expense',
    merchant: 'Whole Foods',
    location: 'San Francisco, CA'
  },
  {
    id: '6',
    description: 'Monthly Salary',
    amount: 4250.00,
    category: 'Income',
    date: '2025-04-01',
    type: 'income',
    merchant: 'Tech Corp Inc'
  },
  {
    id: '7',
    description: 'Apartment Rent',
    amount: 1800.00,
    category: 'Housing',
    date: '2025-04-01',
    type: 'expense',
  },
  {
    id: '8',
    description: 'Uber Ride',
    amount: 18.50,
    category: 'Transportation',
    date: '2025-04-09',
    type: 'expense',
    merchant: 'Uber',
    location: 'San Francisco, CA'
  },
  {
    id: '9',
    description: 'Starbucks Coffee',
    amount: 5.75,
    category: 'Food',
    date: '2025-04-11',
    type: 'expense',
    merchant: 'Starbucks',
    location: 'San Francisco, CA'
  },
  {
    id: '10',
    description: 'Amazon Purchase',
    amount: 67.99,
    category: 'Shopping',
    date: '2025-04-07',
    type: 'expense',
    merchant: 'Amazon',
  },
];

// Mock AI-generated insights
const mockInsights: InsightType[] = [
  {
    title: 'Recurring Subscription Alert',
    description: 'You have 3 overlapping streaming subscriptions totaling $35/month. Consider reviewing Netflix, Hulu, and Disney+ subscriptions.',
    type: 'warning',
    icon: 'alert-circle',
  },
  {
    title: 'Smart Shopping Opportunity',
    description: 'Your grocery spending peaks on weekends. Shopping on Wednesday evenings could save you ~15% based on historical prices.',
    type: 'tip',
    icon: 'lightbulb',
  },
  {
    title: 'Savings Milestone',
    description: "Great job! You've reduced dining out expenses by 20% compared to last month.",
    type: 'achievement',
    icon: 'trophy',
  },
];

export default function MainAppScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories] = useState<Category[]>([
    { 
      name: 'Food', 
      budget: 500, 
      icon: 'food',
      insights: [
        'Grocery spending is 15% higher than similar households',
        'Most expensive shopping day: Saturdays',
        "Frequent stores: Whole Foods (65%), Trader Joe's (25%)",
      ],
    },
    { 
      name: 'Entertainment', 
      budget: 200, 
      icon: 'movie',
      insights: [
        'Subscription overlap detected',
        'Peak entertainment spending: Weekends',
        'Digital vs Physical: 80% digital purchases',
      ],
    },
    { 
      name: 'Transport', 
      budget: 300, 
      icon: 'car',
      insights: [
        'Public transit could save $150/month',
        'Peak ride-share times: Friday nights',
        'Consider carpooling options',
      ],
    },
    { 
      name: 'Housing', 
      budget: 2000, 
      icon: 'home',
      insights: [
        'Utilities 20% above average',
        'Consider energy-efficient upgrades',
        'Rent is within market range',
      ],
    },
  ]);
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

  const addTransaction = () => {
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
              {mockInsights.map((insight, index) => (
                <View key={index}>
                  {renderInsightCard(insight)}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.transactionsList}>
              {transactions.map(transaction => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionMeta}>
                      {transaction.category} • {transaction.date}
                      {transaction.merchant && ` • ${transaction.merchant}`}
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
}); 